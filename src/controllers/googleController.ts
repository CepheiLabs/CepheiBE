import handleAsync from "express-async-handler";
import type { Request, Response } from "express";

import { googleSigninSchema } from "../validators/index.js";
import { ValidationError } from "../errors/index.js";
import * as googleService from "../services/googleService.js";
import { sendAuthResponse } from "../utils/authResponse.js";

/**
 * @desc    Sign in with google
 * @route   POST /api/v1/auth/google/login
 * @access  Public
 */
const googleSignin = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate the incoming idToken
  const result = googleSigninSchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Invalid google token data",
      result.error.flatten().fieldErrors,
    );
  }

  // 2. Verify with Google and get user data
  const googleUser = await googleService.verifyGoogleToken(result.data.idToken);

  // 3. Find existing or Create new player record
  const player = await googleService.findOrCreateGooglePlayer(googleUser);

  // 4. Send Response via Utility
  sendAuthResponse(res, player, 200, "Successfully logged in with Google");
});

export { googleSignin };
