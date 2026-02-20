import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { verifyMessage } from "ethers";

import { redisClient } from "../utils/redis";
import { db } from "../db";
import { playersTable } from "../db/schema";
import { ValidationError, ConflictError, InternalServerError } from "../errors";

/**
 *
 * @desc generates a nonce and sends to the redis store
 */
export const generateAndSaveNonce = async (
  address: string,
): Promise<string> => {
  const nonce = crypto.randomBytes(16).toString("hex");
  const normalizedAddress = address.toLowerCase();

  await redisClient.set(`nonce:${normalizedAddress}`, nonce, {
    expiration: {
      type: "EX",
      value: 300, // 5 minutes
    },
  });

  return nonce;
};

/**
 * @desc gets nonce from redis store
 */
export const getNonceFromStore = async (
  address: string,
): Promise<string | null> => {
  return await redisClient.get(`nonce:${address.toLowerCase()}`);
};

/**
 * @desc deletes nonce from the redis store
 */
export const deleteNonceFromStore = async (address: string): Promise<void> => {
  await redisClient.del(`nonce:${address.toLowerCase()}`);
};

// Helper to verify the actual crypto signature
/**
 * @desc verifies signature against address
 */
export const verifySignature = async (address: string, signature: string) => {
  const normalizedAddress = address.toLowerCase();
  const savedNonce = await getNonceFromStore(normalizedAddress);

  if (!savedNonce) {
    throw new ValidationError("Nonce expired or not found.");
  }

  const message = `Welcome to Cephi! Sign this message to verify ownership. Nonce: ${savedNonce}`;

  try {
    const recoveredAddress = verifyMessage(message, signature).toLowerCase();
    if (recoveredAddress !== normalizedAddress) {
      throw new ValidationError("Signature verification failed.");
    }
  } catch (err) {
    throw new ValidationError("Invalid signature format.");
  }

  // Burn nonce after successful verification
  await deleteNonceFromStore(normalizedAddress);
};

// Helper to handle the DB logic (Linking vs New Guest)
/**
 * @desc Links wallet if there is an identity, else does a guest login with wallet
 */
export const handlePlayerWalletLink = async (
  address: string,
  currentUserId?: string,
) => {
  const normalizedAddress = address.toLowerCase();

  let player = await db.query.playersTable.findFirst({
    where: eq(playersTable.walletAddress, normalizedAddress),
  });

  // CASE A: User is already logged in (Linking)
  if (currentUserId) {
    if (player && player.id !== currentUserId) {
      throw new ConflictError(
        "This wallet is already linked to another account",
      );
    }
    if (!player) {
      [player] = await db
        .update(playersTable)
        .set({ walletAddress: normalizedAddress })
        .where(eq(playersTable.id, currentUserId))
        .returning();
    }
  }
  // CASE B: Wallet-Only Login
  else if (!player) {
    [player] = await db
      .insert(playersTable)
      .values({
        walletAddress: normalizedAddress,
        username: `player_${normalizedAddress.slice(2, 8)}`,
      })
      .returning();
  }

  if (!player) throw new InternalServerError("Failed to process wallet login");
  return player;
};
