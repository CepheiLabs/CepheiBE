import handleAsync from "express-async-handler";
import type { NextFunction, Request, Response } from "express";
import { or, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { db } from "../db";
import {
  loginSchema,
  registrationSchema,
  walletNonceSchema,
  walletVerifySchema,
} from "../validators";
import {
  ConflictError,
  InternalServerError,
  UnauthorizedError,
  ValidationError,
} from "../errors";
import { playersRelations, playersTable } from "../db/schema";
import { signToken } from "../utils/jwt";
import { redisClient } from "../utils/redis";
import { verifyMessage } from "ethers";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

/**
 * @desc    Register player & get token
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const registerPlayer = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate User
  const result = registrationSchema.safeParse(req.body);
  if (!result.success)
    throw new ValidationError(
      "Invalid input data",
      result.error.flatten().fieldErrors,
    );

  const { email, username, password, avatarUrl } = result.data;

  // 2. Check for existing User
  const existingPlayer = await db
    .select()
    .from(playersTable)
    .where(
      or(eq(playersTable.email, email), eq(playersTable.username, username)),
    )
    .limit(1);

  if (existingPlayer.length > 0) {
    throw new ConflictError("Email or username already exists");
  }

  // 3. Hash password to store in DB
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const [newPlayer] = await db
    .insert(playersTable)
    .values({
      email,
      username,
      password: hashedPassword,
      ...(avatarUrl && { avatarUrl }),
    })
    .returning({
      id: playersTable.id,
      email: playersTable.email,
      username: playersTable.username,
    });

  if (!newPlayer)
    throw new InternalServerError("Something went wrong while registering");

  const token = signToken(newPlayer.id);

  // 4. Store token and send response
  res
    .status(201)
    .cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, //one day
      path: "/",
    })
    .json({
      status: "success",
      message: "Player registered successfully",
      data: {
        player: newPlayer,
        accessToken: token,
      },
    });
});

/**
 * @desc    Authenticate player & get token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate User
  const result = loginSchema.safeParse(req.body);
  if (!result.success)
    throw new ValidationError(
      "Invalid input data",
      result.error.flatten().fieldErrors,
    );

  const { email, password } = result.data;

  // 2. Check if player exists
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.email, email))
    .limit(1);

  if (!player || !player.password) {
    throw new ValidationError("Invalid email or password");
  }

  // 3. Compare hashed passwords
  const isMatch = await bcrypt.compare(password, player.password);

  if (!isMatch) {
    throw new ValidationError("Invalid email or password");
  }

  const accessToken = signToken(player.id);

  // 4. Store token and send response
  res
    .status(200)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, //one day
      path: "/",
    })
    .json({
      status: "success",
      message: "Player logged in successfully",
      data: {
        player: {
          id: player.id,
          email: player.email,
          username: player.username,
        },
        accessToken: accessToken,
      },
    });
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
    const message = `Welcome to Cephi! Sign this message to verify ownership. \n\nNonce: ${savedNonce}`;

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
export { registerPlayer, login, logout, getWalletNonce, verifyWallet };
