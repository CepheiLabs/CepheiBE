import { pgEnum, PgEnum } from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum("game_status", [
  "PENDING",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);

export const gameCategoryEnum = pgEnum("game_category", [
  "COIN_FLIP",
  "DICE_ROLL",
]);

export const transactionTypeEnum = pgEnum("tx_type", ["DEPOSIT", "WITHDRAWAL"]);

export const raffleStatusEnum = pgEnum("raffle_status", ["OPEN", "CLOSE"]);
