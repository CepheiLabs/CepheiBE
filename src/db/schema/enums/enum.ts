import { pgEnum } from "drizzle-orm/pg-core";

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

export const tokenPurposeEnum = pgEnum("token_purpose", [
  "RESET",
  "VERIFY_EMAIL",
]);

export const transactionTypeEnum = pgEnum("tx_type", ["DEPOSIT", "WITHDRAWAL"]);

export const raffleStatusEnum = pgEnum("raffle_status", ["OPEN", "CLOSE"]);
