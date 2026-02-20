import { eq } from "drizzle-orm";

import googleAuthClient from "../utils/googleAuthCient";
import { db } from "../db";
import { playersTable } from "../db/schema";
import { ValidationError, InternalServerError } from "../errors";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;

export const verifyGoogleToken = async (idToken: string) => {
  const ticket = await googleAuthClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new ValidationError("Google token valid but missing email");
  }

  return payload; // { email, sub, name, picture, etc. }
};

export const findOrCreateGooglePlayer = async (payload: any) => {
  const { email, sub: googleId, name, picture } = payload;

  let player = await db.query.playersTable.findFirst({
    where: eq(playersTable.email, email),
  });

  if (!player) {
    // Scenario 1: Total Newbie
    [player] = await db
      .insert(playersTable)
      .values({
        email,
        googleId,
        username: name || `player_${googleId.slice(0, 5)}`,
        avatarUrl: picture,
      })
      .returning();
  } else if (!player.googleId) {
    // Scenario 2: Existing Email user logging in with Google for the first time
    [player] = await db
      .update(playersTable)
      .set({ googleId, avatarUrl: player.avatarUrl || picture })
      .where(eq(playersTable.id, player.id))
      .returning();
  }

  if (!player)
    throw new InternalServerError("Failed to process Google account");
  return player;
};
