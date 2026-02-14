import { relations } from "drizzle-orm";
import { playersTable, gamesTable, rafflesTable } from "./index";

export const playersRelations = relations(playersTable, ({ many }) => ({
  hostedGames: many(playersTable, { relationName: "host" }),
  opponentGames: many(gamesTable, { relationName: "opponent" }),
  wonGames: many(gamesTable, { relationName: "winner" }),
  wonRaffles: many(rafflesTable, { relationName: "raffleWinner" }),
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
