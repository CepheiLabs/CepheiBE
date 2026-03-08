import { db } from "../db";
import { tokensTable } from "../db/schema";

import { or, lt, eq } from "drizzle-orm";

const clearUsedTokens = async () => {
  await db
    .delete(tokensTable)
    .where(
      or(lt(tokensTable.expiresAt, new Date()), eq(tokensTable.used, true)),
    );
};

export default clearUsedTokens;
