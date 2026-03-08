import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors";
import * as playerService from "../services/playerService";

const isVerifiedOrWallet = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const player = req.user;
  if (!player || !player.id)
    throw new UnauthorizedError(
      "You are not allowed access to this resource, please login",
    );

  const playerData = playerService.findById(player.id);

  if (!playerData) throw new UnauthorizedError("User does not exist");
};

export { isVerifiedOrWallet };
