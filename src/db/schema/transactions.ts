import {
  uuid,
  varchar,
  timestamp,
  decimal,
  pgTable,
} from "drizzle-orm/pg-core";

import { playersTable } from "./index.js";
import { transactionTypeEnum } from "./enums.js";

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .references(() => playersTable.id)
    .notNull(),
  type: transactionTypeEnum().notNull(),
  amount: decimal("amount", { precision: 32, scale: 18 }).notNull(),
  txHash: varchar("tx_hash", { length: 255 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
