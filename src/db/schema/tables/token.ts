import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { playersTable } from "./tables";
import { tokenPurposeEnum } from "../enums/enum";

export const tokensTable = pgTable(
  "tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id").references(() => playersTable.id),
    tokenHash: varchar("token_hash", { length: 255 }).unique(),
    purpose: tokenPurposeEnum("purpose").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    used: boolean("has_been_used").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("token_purpose_index").on(table.playerId, table.purpose)],
);
