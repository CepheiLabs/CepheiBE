import crypto from "crypto";
import { db } from "../db";
import { tokensTable } from "../db/schema";
import { and, eq, gt } from "drizzle-orm";

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

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); //15 minutes

  // 3. Insert fresh record
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
export const validateToken = async (token: string) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await db.query.tokensTable.findFirst({
    where: and(
      eq(tokensTable.tokenHash, tokenHash),
      eq(tokensTable.used, false),
      gt(tokensTable.expiresAt, new Date()),
    ),
  });

  if (!record) return null;

  // Burn it to hell ❤️‍🔥❤️‍🔥❤️‍🔥
  await db
    .update(tokensTable)
    .set({ used: true })
    .where(eq(tokensTable.id, record.id));

  return record;
};

/**
 * @desc Creates an email verification token
 * @param playerId player id
 * @returns the verification token
 */
// NOTE: I know this is violating the DRY principle but I want to keep one service to do just one thing 👍👍👍👍
export const createEmailVerificationToken = async (playerId: string) => {
  // 1. CLEAR THE Bouncer & Invalidate old links
  // This handles both expired-but-unused tokens AND still-valid tokens.
  // It clears the path for the unique index 100% of the time.
  await db
    .update(tokensTable)
    .set({ used: true })
    .where(
      and(
        eq(tokensTable.playerId, playerId),
        eq(tokensTable.purpose, "VERIFY_EMAIL"),
        eq(tokensTable.used, false),
      ),
    );

  // 2. Generate new token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto
    .createHash("sha256")
    .update(emailVerificationToken)
    .digest("hex");

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

  // Insert Fresh Records;
  await db.insert(tokensTable).values({
    playerId,
    tokenHash,
    purpose: "VERIFY_EMAIL",
    expiresAt,
  });

  return emailVerificationToken;
};
