import handleAsync from "express-async-handler";
import type { Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import * as playerService from "../services/playerService";

const getMe = handleAsync(async (req: Request, res: Response) => {
  // 1. Get ID from req.user
  const player = req.user;
  if (!player || !player.id)
    throw new UnauthorizedError("You are not allowed access to this resource");
  const playerId = player.id;

  // 2. Get from DB
  const playerData = await playerService.findById(playerId);

  // 3. Send Response
  res.status(200).json({
    status: "success",
    message: "Fetched player data successfully",
    data: {
      player: playerData,
    },
  });
});

export { getMe };
