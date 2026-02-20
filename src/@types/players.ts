import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { playersTable } from "../db/schema";

export type Player = InferSelectModel<typeof playersTable>;
export type NewPlayer = InferInsertModel<typeof playersTable>;
export type PlayerUpdate = Partial<NewPlayer>;
