import {
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  index,
  boolean,
} from "drizzle-orm/pg-core";

export const playersTable = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).unique(),
    googleId: varchar("google_id", { length: 255 }).unique(),
    walletAddress: varchar("wallet_address", { length: 255 }).unique(),
    username: varchar("username", { length: 255 }).unique(),
    password: text("password"),
    avatarUrl: text("avatar_url"),
    lastSeen: timestamp("last_seen").defaultNow().notNull(),

    isVerifiedEmail: boolean("is_verified_email").default(false),
    totalGames: integer("total_games").default(0).notNull(),
    totalWins: integer("total_wins").default(0).notNull(),
    totalLosses: integer("total_losses").default(0).notNull(),
    totalEarnings: decimal("total_earnings", {
      precision: 32,
      scale: 18,
    })
      .default("0")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }),
    // updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("wins_idx").on(table.totalWins), //For (Quick lookup) leaderboards based on wins
    index("total_earnings_idx").on(table.totalEarnings), //For (Quick lookup) leaderboards based on earnings
  ],
);
