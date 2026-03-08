import { eq } from "drizzle-orm";
import type { TokenPayload } from "google-auth-library"; // Import the actual type!

import googleAuthClient from "../utils/googleAuthCient.js";
import { db } from "../db/index.js";
import { playersTable } from "../db/schema/index.js";
import { ValidationError, InternalServerError } from "../errors/index.js";
import type { Player } from "../@types/index.js"; // Reuse your Player type

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;

/**
 * @desc Verifies google token gotten from the client
 */
export const verifyGoogleToken = async (
  idToken: string,
): Promise<TokenPayload> => {
  const ticket = await googleAuthClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ValidationError("Google token valid but missing email");
  }

  return payload;
};

/**
 * @desc finds a player by email, on failure, will create one using google credentials
 */
export const findOrCreateGooglePlayer = async (
  payload: TokenPayload,
): Promise<Player> => {
  const { email, sub: googleId, given_name, picture } = payload;

  // email is definitely here because of our check in verifyGoogleToken
  const targetEmail = email!;

  let player = await db.query.playersTable.findFirst({
    where: eq(playersTable.email, targetEmail),
  });

  if (!player) {
    // Scenario 1: Total Newbie
    [player] = await db
      .insert(playersTable)
      .values({
        email: targetEmail,
        googleId,
        username: given_name
          ? `${given_name?.toLowerCase()}_${googleId.slice(0, 5)}`
          : `$player_${googleId.slice(0, 5)}`,
        avatarUrl: picture,
      })
      .returning();
  } else if (!player.googleId) {
    // Scenario 2: Existing Email user linking Google for the first time
    [player] = await db
      .update(playersTable)
      .set({ googleId, avatarUrl: player.avatarUrl || picture })
      .where(eq(playersTable.id, player.id))
      .returning();
  }

  if (!player) {
    throw new InternalServerError("Failed to process Google account");
  }

  return player;
};
