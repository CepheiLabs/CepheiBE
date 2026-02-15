import handleAsync from "express-async-handler";
import type { Request, Response } from "express";
import { or, eq } from "drizzle-orm";
import bcrypt from "bcrypt";

import { db } from "../db";
import { registrationSchema } from "../validators";
import { ConflictError, InternalServerError, ValidationError } from "../errors";
import { playersTable } from "../db/schema";
import { signToken } from "../utils/jwt";

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "10", 10);

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
  const existingUser = await db
    .select()
    .from(playersTable)
    .where(
      or(eq(playersTable.email, email), eq(playersTable.username, username)),
    )
    .limit(1);

  if (existingUser.length > 0) {
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

export { registerPlayer };
