import handleAsync from "express-async-handler";
import type { NextFunction, Request, Response } from "express";
import { or, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { verifyMessage } from "ethers";

import { db } from "../db";
import {
  googleSigninSchema,
  loginSchema,
  registrationSchema,
  walletNonceSchema,
  walletVerifySchema,
} from "../validators";
import { ConflictError, InternalServerError, ValidationError } from "../errors";
import { playersTable } from "../db/schema";
import { signToken } from "../utils/jwt";
import { redisClient } from "../utils/redis";
import googleAuthClient from "../utils/googleAuthCient";

import {
  findByEmailOrUsername,
  createPlayer,
  findByEmail,
} from "../services/playerService";
import { sendAuthResponse } from "../utils/authResponse";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  throw new InternalServerError("Env config issues!!!");
}

/**
 * @desc    Register player & get token
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerPlayer = handleAsync(async (req: Request, res: Response) => {
  const result = registrationSchema.safeParse(req.body);
  if (!result.success)
    throw new ValidationError(
      "Invalid data",
      result.error.flatten().fieldErrors,
    );

  const { email, username, password, avatarUrl } = result.data;

  // 1. Use Service
  const existing = await findByEmailOrUsername(email, username);
  if (existing) throw new ConflictError("Email or username already exists");

  // 2. Hash and Create
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newPlayer = await createPlayer({
    email,
    username,
    password: hashedPassword,
    avatarUrl,
  });

  // 3. Use Utility
  sendAuthResponse(res, newPlayer, 201, "Player registered successfully");
});

/**
 * @desc    Authenticate player & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate Input
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Invalid input data",
      result.error.flatten().fieldErrors,
    );
  }

  const { email, password } = result.data;

  // 2. Find Player via Service
  // We'll add findByEmail to playerService.ts
  const player = await findByEmail(email);

  if (!player || !player.password) {
    throw new ValidationError("Invalid email or password");
  }

  // 3. Compare hashed passwords
  const isMatch = await bcrypt.compare(password, player.password);
  if (!isMatch) {
    throw new ValidationError("Invalid email or password");
  }

  // 4. Send Response via Utility
  // This handles the signToken, res.status, res.cookie, and res.json in one go!
  sendAuthResponse(res, player, 200, "Player logged in successfully");
});

/**
 * @desc    Logout & remove token
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = handleAsync(async (req: Request, res: Response) => {
  // 1. Remove token
  res
    .status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    })
    .json({
      status: "success",
      message: "Logged out successfully",
    });
});

/**
 * @desc    Generate nonce via Request Body
 * @route   POST /api/v1/auth/wallet/nonce
 */
const getWalletNonce = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate body
  const result = walletNonceSchema.safeParse(req.body);

  if (!result.success) {
    throw new ValidationError(
      "Invalid wallet address",
      result.error.flatten().fieldErrors,
    );
  }

  // 2. Destructure
  const { address } = result.data;
  const nonce = crypto.randomBytes(16).toString("hex");

  // 3. Redify
  await redisClient.set(`nonce:${address}`, nonce, {
    expiration: {
      type: "EX",
      value: 300,
    },
  });

  //4. Send response
  res.status(200).json({
    status: "success",
    data: {
      nonce,
      message: `Welcome to Cephi! Sign this message to verify ownership. Nonce: ${nonce}`,
    },
  });
});

/**
 * @desc    Verify signature and link wallet to the email account
 * @route   POST /api/v1/auth/wallet/verify
 * @access  Private (Requires JWT from Step 1)
 */

const verifyWallet = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validate body
    const result = walletVerifySchema.safeParse(req.body);
    if (!result.success)
      throw new ValidationError(
        "Invalid signature data",
        result.error.flatten().fieldErrors,
      );

    // 2. Get nonce from redis (FIXED: Added $)
    const { address, signature } = result.data;
    const normalizedAddress = address.toLowerCase();
    const savedNonce = await redisClient.get(`nonce:${normalizedAddress}`);

    if (!savedNonce) {
      throw new ValidationError(
        "Nonce expired or not found. Please request a new one.",
      );
    }

    // 3. Reconstructing message (FIXED: Added \n\n to match getWalletNonce)
    const message = `Welcome to Cephi! Sign this message to verify ownership. Nonce: ${savedNonce}`;

    // 4. Recovering address
    let recoveredAddress: string;
    try {
      recoveredAddress = verifyMessage(message, signature).toLowerCase();
    } catch (err) {
      throw new ValidationError("Invalid signature format.");
    }

    // 5. Compare
    if (recoveredAddress !== normalizedAddress)
      throw new ValidationError("Signature verification failed.");

    // 6. Burn nonce 💀
    await redisClient.del(`nonce:${normalizedAddress}`);

    // 7. Check DB for existing owner
    let player = await db.query.playersTable.findFirst({
      where: eq(playersTable.walletAddress, normalizedAddress),
    });

    const currentUserId = req.user?.id;
    console.log(`user: ${currentUserId}`);

    // 8. CASE A: Linking to an existing session (Email user connecting wallet)
    if (currentUserId) {
      if (player && player.id !== currentUserId) {
        throw new ConflictError(
          "This wallet is already linked to another account",
        );
      }

      if (!player) {
        [player] = await db
          .update(playersTable)
          .set({
            walletAddress: normalizedAddress,
            // updatedAt: new Date()
          })
          .where(eq(playersTable.id, currentUserId))
          .returning();
      }
    }
    // 9. CASE B: Wallet-Only Login (No email session exists)
    else {
      if (!player) {
        // Create a new "Guest" player if they don't exist yet
        [player] = await db
          .insert(playersTable)
          .values({
            walletAddress: normalizedAddress,
            username: `player_${normalizedAddress.slice(2, 8)}`,
          })
          .returning();
      }
    }

    if (!player)
      throw new InternalServerError("Failed to process wallet login");

    // 10. Issue Token
    const accessToken = signToken(player.id);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      })
      .json({
        status: "success",
        message: "Wallet verified successfully",
        data: { player, accessToken },
      });
  },
);

/**
 * @desc    Sign in with google
 * @route   POST /api/v1/auth/google/login
 * @access  Public
 */

const googleSignin = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1. Validate
    const result = googleSigninSchema.safeParse(req.body);
    if (!result.success)
      throw new ValidationError(
        "Invalid google token data",
        result.error.flatten().fieldErrors,
      );

    const { idToken } = result.data;

    // 2. Verify with google
    const ticket = await googleAuthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email)
      throw new ValidationError("Google token valid but missing email");

    // 3. Extract
    const { email, sub: googleId, name, picture } = payload;

    // 4. Find or create from DB
    let player = await db.query.playersTable.findFirst({
      where: eq(playersTable.email, email),
    });

    if (!player) {
      // Insert new player
      const [newPlayer] = await db
        .insert(playersTable)
        .values({
          email,
          googleId,
          username: name || `player_${googleId.slice(0, 5)}`,
          avatarUrl: picture,
        })
        .returning();
      player = newPlayer;
    } else if (!player.googleId) {
      // Existing Player update
      const [updatedPlayer] = await db
        .update(playersTable)
        .set({ googleId, avatarUrl: player.avatarUrl || picture })
        .where(eq(playersTable.id, player.id))
        .returning();
      player = updatedPlayer;
    }

    if (!player)
      throw new InternalServerError("Failed to process Google account");

    // 5. Issue token
    const accessToken = signToken(player.id);

    // 6. Send res + cookies
    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        status: "success",
        message: "Successfully logged in with google",
        data: {
          player: {
            id: player.id,
            email: player.email,
            username: player.username,
            walletAddress: player.walletAddress,
          },
          accessToken,
        },
      });
  },
);

export {
  registerPlayer,
  login,
  logout,
  getWalletNonce,
  verifyWallet,
  googleSignin,
};
