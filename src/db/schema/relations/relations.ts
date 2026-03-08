import { relations } from "drizzle-orm";
import { playersTable, gamesTable, rafflesTable } from "../tables/tables";
import { transactionsTable } from "../tables/transactions";

export const playersRelations = relations(playersTable, ({ many }) => ({
  hostedGames: many(gamesTable, { relationName: "host" }),
  opponentGames: many(gamesTable, { relationName: "opponent" }),
  wonGames: many(gamesTable, { relationName: "winner" }),
  wonRaffles: many(rafflesTable, { relationName: "raffleWinner" }),
  transactions: many(transactionsTable, { relationName: "playerTransactions" }),
}));

export const gamesRelations = relations(gamesTable, ({ one }) => ({
  host: one(playersTable, {
    fields: [gamesTable.hostId],
    references: [playersTable.id],
    relationName: "host",
  }),
  opponent: one(playersTable, {
    fields: [gamesTable.opponentId],
    references: [playersTable.id],
    relationName: "opponent",
  }),
  winner: one(playersTable, {
    fields: [gamesTable.winnerId],
    references: [playersTable.id],
    relationName: "winner",
  }),
}));

export const transactionsRelations = relations(
  transactionsTable,
  ({ one }) => ({
    player: one(playersTable, {
      fields: [transactionsTable.id],
      references: [playersTable.id],
      relationName: "playerTransactions",
    }),
  }),
);

export const rafflesRelations = relations(rafflesTable, ({ one }) => ({
  winner: one(playersTable, {
    fields: [rafflesTable.winnerId],
    references: [playersTable.id],
    relationName: "raffleWinner",
  }),
}));
