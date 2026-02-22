import crypto from "crypto";
import { db } from "../db";
import { tokensTable } from "../db/schema";
import { and, eq, gt } from "drizzle-orm";
import { BadRequestError } from "../errors";

/**
 * @desc Creates a passwod reset token
 * @param playerId player id
 * @returns the reset token
 */
export const createPasswordResetToken = async (playerId: string) => {
  // 1. CLEAR THE Bouncer & Invalidate old links
  // This handles both expired-but-unused tokens AND still-valid tokens.
  // It clears the path for the unique index 100% of the time.
  await db
    .update(tokensTable)
    .set({ used: true })
    .where(
      and(
        eq(tokensTable.playerId, playerId),
        eq(tokensTable.purpose, "PASSWORD_RESET"),
        eq(tokensTable.used, false),
      ),
    );

  // 2. Generate new token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // 3. Insert fresh record (No more 500 errors!)
  await db.insert(tokensTable).values({
    playerId,
    tokenHash,
    purpose: "PASSWORD_RESET",
    expiresAt,
  });

  return resetToken;
};
/**
 * @decs Validates provided token against hashed version in the database
 * @param token the raw token
 * @returns promise
 */
export const validateResetToken = async (token: string) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return await db.query.tokensTable.findFirst({
    where: and(
      eq(tokensTable.tokenHash, tokenHash),
      eq(tokensTable.used, false),
      gt(tokensTable.expiresAt, new Date()),
    ),
  });
};
