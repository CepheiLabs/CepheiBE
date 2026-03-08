import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { playersTable } from "../db/schema/index.js";
import { InternalServerError } from "../errors/index.js";
import type { Player, NewPlayer, PlayerUpdate } from "../@types/index.js";
import { handleDbError } from "../errors/handleDbError.js";

// TYPES

/**
 * @desc Finds player by email or username
 */
export const findByEmailOrUsername = async (
  email: string,
  username: string,
): Promise<Player | undefined> => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(
      or(eq(playersTable.email, email), eq(playersTable.username, username)),
    )
    .limit(1);
  return player;
};

/**
 * @desc Creates a new player
 */
export const createPlayer = async (values: NewPlayer): Promise<Player> => {
  const [player] = await db.insert(playersTable).values(values).returning();
  if (!player) {
    throw new InternalServerError("Failed to create player record");
  }
  return player;
};

/**
 * @desc updates player fields
 */
export const updatePlayer = async (
  id: string,
  values: PlayerUpdate,
): Promise<Player | undefined> => {
  const [player] = await db
    .update(playersTable)
    .set(values)
    .where(eq(playersTable.id, id))
    .returning()
    .catch(handleDbError);
  return player;
};

/**
 * @desc finds a player by email
 */
export const findByEmail = async (
  email: string,
): Promise<Player | undefined> => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.email, email))
    .limit(1);
  return player;
};

/**
 * @desc Finds a player by ID with sensitive fields removed by default
 */
export const findById = async (
  id: string,
  includeSensitive = false,
): Promise<Player | undefined> => {
  const result = await db.query.playersTable.findFirst({
    where: eq(playersTable.id, id),
    columns: {
      password: includeSensitive,
      googleId: includeSensitive,
      // You can add other internal fields here too
    },
  });

  return (result as Player) || undefined;
};

/**
 * @desc Hashes and updates a player's password
 * @param playerId - The UUID of the player
 * @param newPassword - The plain text password
 */
export const updatePassword = async (playerId: string, newPassword: string) => {
  // 1. Hash the password

  // NOTE: I did the hashing here, feel free to change if you like
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // 2. Update DB
  await db
    .update(playersTable)
    .set({ password: hashedPassword })
    .where(eq(playersTable.id, playerId));
};

/**
 * @desc Marks email to be verified
 * @param playerId - UUID of the player
 */
export const markAsVerified = async (playerId: string) => {
  await db
    .update(playersTable)
    .set({ isVerifiedEmail: true })
    .where(eq(playersTable.id, playerId));
};
