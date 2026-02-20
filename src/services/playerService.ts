import { eq, or } from "drizzle-orm";
import { db } from "../db";
import { playersTable } from "../db/schema";

export const findByEmailOrUsername = async (
  email: string,
  username: string,
) => {
  const results = await db
    .select()
    .from(playersTable)
    .where(
      or(eq(playersTable.email, email), eq(playersTable.username, username)),
    )
    .limit(1);
  return results[0];
};

export const createPlayer = async (values: any) => {
  const [player] = await db.insert(playersTable).values(values).returning();
  return player;
};

export const updatePlayer = async (id: string, values: any) => {
  const [player] = await db
    .update(playersTable)
    .set(values)
    .where(eq(playersTable.id, id))
    .returning();
  return player;
};

export const findByEmail = async (email: string) => {
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.email, email))
    .limit(1);
  return player;
};
