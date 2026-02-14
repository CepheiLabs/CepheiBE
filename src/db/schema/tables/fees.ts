import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const feesTable = pgTable("fees", {
  id: uuid("id").primaryKey().defaultRandom(),
  gameId: uuid("game_id"), // Optional: can link to gamesTable.id
  amount: decimal("amount", { precision: 32, scale: 18 }).notNull(),
  sourceContract: varchar("source_contract", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
