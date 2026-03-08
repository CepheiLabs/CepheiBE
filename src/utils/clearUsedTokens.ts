import { db } from "../db/index.js";
import { tokensTable } from "../db/schema/index.js";

import { or, lt, eq } from "drizzle-orm";

const clearUsedTokens = async () => {
  await db
    .delete(tokensTable)
    .where(
      or(lt(tokensTable.expiresAt, new Date()), eq(tokensTable.used, true)),
    );
};

export default clearUsedTokens;
