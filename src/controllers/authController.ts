import handleAsync from "express-async-handler";
import type { Request, Response } from "express";
import { or, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

import { db } from "../db";
import {
  loginSchema,
  registrationSchema,
  walletNonceSchema,
} from "../validators";
import { ConflictError, InternalServerError, ValidationError } from "../errors";
import { playersTable } from "../db/schema";
import { signToken } from "../utils/jwt";
import { redisClient } from "../utils/redis";

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
      message: `Welcome to Cephi! Sign this message to verify ownership. \n\nNonce: ${nonce}`,
    },
  });
});

//TODO: WALLET VERIFICATION AND GOOGLE AUTH

export { registerPlayer, login, logout, getWalletNonce };
