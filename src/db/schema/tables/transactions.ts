import {
  uuid,
  varchar,
  timestamp,
  decimal,
  pgTable,
  index,
} from "drizzle-orm/pg-core";

import { playersTable } from "./players";
import { transactionTypeEnum } from "../enums/enum";

export const transactionsTable = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .references(() => playersTable.id)
      .notNull(),
    type: transactionTypeEnum("tx_type").notNull(),
    amount: decimal("amount", { precision: 32, scale: 18 }).notNull(),
    txHash: varchar("tx_hash", { length: 255 }).unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("player_id_idx").on(table.playerId), //For quick look up of a player
    index("created_at_idx").on(table.createdAt), //For quick look up on latest transactions
  ],
);
