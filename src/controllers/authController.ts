import handleAsync from "express-async-handler";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import {
  resetPasswordSchema,
  loginSchema,
  registrationSchema,
  requestTokenSchema,
} from "../validators";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  ValidationError,
} from "../errors";
import * as playerService from "../services/playerService";
import * as tokenService from "../services/tokenService";
import * as mailService from "../services/mailService";
import { logoutCookieOptions, sendAuthResponse } from "../utils/authResponse";

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
  const existing = await playerService.findByEmailOrUsername(email, username);
  if (existing) throw new ConflictError("Email or username already exists");

  // 2. Hash and Create
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const newPlayer = await playerService.createPlayer({
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
  const player = await playerService.findByEmail(email);

  if (!player || !player.password) {
    throw new ValidationError("Invalid email or password");
  }

  // 3. Compare hashed passwords
  const isMatch = await bcrypt.compare(password, player.password);
  if (!isMatch) {
    throw new ValidationError("Invalid email or password");
  }

  // 4. Send Response
  sendAuthResponse(res, player, 200, "Player logged in successfully");
});

/**
 * @desc    Logout & remove token
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = handleAsync(async (req: Request, res: Response) => {
  // 1. Remove token
  res.status(200).clearCookie("accessToken", logoutCookieOptions).json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * @desc Request a reset password reset
 * @route POST /api/v1/auth/request-reset
 * @access Public
 */
const requestPasswordReset = handleAsync(
  async (req: Request, res: Response) => {
    // 1. Validate
    const result = requestTokenSchema.safeParse(req.body);
    if (!result.success)
      throw new ValidationError(
        "Invalid data!!!",
        result.error.flatten().fieldErrors,
      );
    const { email } = result.data;

    // 2. Find player by email
    const player = await playerService.findByEmail(email);

    // 3. Logic Check: Only proceed if player exists AND has a password
    // If player.password is null, they are a Google/OAuth user.
    if (player && player.password !== null) {
      const resetToken = await tokenService.createPasswordResetToken(player.id);

      await mailService.sendPasswordResetEmail(
        email,
        player.username!,
        resetToken,
      );
    }

    res.status(200).json({
      status: "success",
      message:
        "If an account with a password exists, a reset link has been sent 🫰.",
    });
  },
);

/**
 * @desc changes password to the new password
 */
const resetPassword = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate
  const result = resetPasswordSchema.safeParse({
    token: req.query.token,
    ...req.body,
  });
  if (!result.success)
    throw new ValidationError(
      "Invalid password reset data!!!",
      result.error.flatten().fieldErrors,
    );
  const { token, newPassword } = result.data;
  // 2. verify and burn token
  const tokenRecord = await tokenService.validateResetToken(token);
  if (!tokenRecord) throw new BadRequestError("Reset link invalid or expired");

  // 3. update password
  await playerService.updatePassword(tokenRecord.playerId!, newPassword);

  // 4. Sending resss.......
  res.status(200).json({
    status: "success",
    message:
      "Password updated successfully! You can now log in with your new credentials.",
  });
});

export { registerPlayer, login, logout, requestPasswordReset, resetPassword };
