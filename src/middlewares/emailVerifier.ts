import type { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors";
import * as playerService from "../services/playerService";

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  const player = req.user;
  if (!player || !player.id)
    throw new UnauthorizedError(
      "You are not allowed access to this resource, please login",
    );

  const playerData = await playerService.findById(player.id);

  if (!playerData) throw new UnauthorizedError("User does not exist");

  if (!playerData.isVerifiedEmail)
    throw new ForbiddenError(
      "Access denied! Please verify your email to continue",
    );

  // Everything well?, on to the next
};

export { verifyEmail };
