import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const feesTable = pgTable("fees", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: decimal("amount", { precision: 32, scale: 18 }).notNull(),
  sourceContract: varchar("source_contract", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
