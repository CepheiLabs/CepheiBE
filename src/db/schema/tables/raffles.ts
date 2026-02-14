import {
  pgTable,
  decimal,
  uuid,
  integer,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";
import { playersTable } from "./players.js";

import { raffleStatusEnum } from "../enums/enum.js";

export const rafflesTable = pgTable("raffles", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketPrice: decimal("ticket_price", { precision: 32, scale: 18 }).notNull(),
  totalPool: decimal("total_pool", { precision: 32, scale: 18 })
    .default("0")
    .notNull(),
  entriesCount: integer("entries_count").default(0).notNull(),
  status: raffleStatusEnum("status").default("OPEN").notNull(),
  winnerId: uuid("winner_id").references(() => playersTable.id),
  txHash: varchar("tx_hash", { length: 255 }),
  endsAt: timestamp("ends_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
