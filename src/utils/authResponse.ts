import type { Response } from "express";
import { signToken } from "./jwt.js";

export const sendAuthResponse = (
  res: Response,
  player: any,
  statusCode: number,
  message: string,
) => {
  const accessToken = signToken(player.id);

  res
    .status(statusCode)
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    })
    .json({
      status: "success",
      message,
      data: {
        player: {
          id: player.id,
          email: player.email,
          username: player.username,
          walletAddress: player.walletAddress,
          avatarUrl: player.avatarUrl,
        },
        accessToken,
      },
    });
};

export const logoutCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};
