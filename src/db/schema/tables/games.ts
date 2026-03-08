import {
  integer,
  uuid,
  jsonb,
  varchar,
  timestamp,
  decimal,
  pgTable,
} from "drizzle-orm/pg-core";

import { gameStatusEnum, gameCategoryEnum } from "../enums/enum.js";
import { playersTable } from "./players.js";

export const gamesTable = pgTable("games", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: gameCategoryEnum("category").notNull(),
  status: gameStatusEnum("status").default("PENDING").notNull(),
  stake: decimal("stake", { precision: 32, scale: 18 }).notNull(),
  hostId: uuid("host_id")
    .references(() => playersTable.id)
    .notNull(),
  opponentId: uuid("opponent_id").references(() => playersTable.id),
  winnerId: uuid("winner_id").references(() => playersTable.id),
  gameData: jsonb("game_data").default({}).notNull(),
  txHash: varchar("tx_hash", { length: 255 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
