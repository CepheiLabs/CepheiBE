import handleAsync from "express-async-handler";
import type { Request, Response } from "express";
import { UnauthorizedError, ValidationError } from "../errors";
import * as playerService from "../services/playerService";
import { updateUsernameSchema } from "../validators/playerValidator";

/**
 * @desc Get details of the logged in player
 */
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

/**
 * @desc updates player username
 */
const updateUsername = handleAsync(async (req: Request, res: Response) => {
  // 1. Get ID from req.user
  const player = req.user;
  if (!player || !player.id)
    throw new UnauthorizedError("You are not allowed access to this resource");
  const playerId = player.id;

  // 2. Verify Schema
  const result = updateUsernameSchema.safeParse(req.body);
  if (!result.success)
    throw new ValidationError(
      "Invalid Username",
      result.error.flatten().fieldErrors,
    );
  const { username } = result.data;

  // 3. Update via service
  const updatedPlayer = await playerService.updatePlayer(playerId, {
    username,
  });

  // 4. Send Response
  res.status(202).json({
    status: "success",
    message: "Update username successfully",
    data: {
      player: updatedPlayer,
    },
  });
});

export { getMe, updateUsername };
