import handleAsync from "express-async-handler";
import type { Request, Response } from "express";

import { walletNonceSchema, walletVerifySchema } from "../validators/index.js";
import { ValidationError } from "../errors/index.js";
import * as walletService from "../services/walletService.js";
import { sendAuthResponse } from "../utils/authResponse.js";

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

  const { address } = result.data;

  // 2. Use Service to generate and save
  const nonce = await walletService.generateAndSaveNonce(address);

  // 3. Send response
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
const verifyWallet = handleAsync(async (req: Request, res: Response) => {
  // 1. Validate Body
  const result = walletVerifySchema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(
      "Invalid signature data",
      result.error.flatten().fieldErrors,
    );
  }

  const { address, signature } = result.data;

  // 2. Verify Ownership via Service
  await walletService.verifySignature(address, signature);

  // 3. Process Player Identity (Link or Login)
  const player = await walletService.handlePlayerWalletLink(
    address,
    req.user?.id,
  );

  // 4. Send Response
  sendAuthResponse(res, player, 200, "Wallet verified successfully");
});

export { getWalletNonce, verifyWallet };
