import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";
import "dotenv/config";

const { Pool } = pg;

// max: 20 is a safe start for most VPS setups.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Error handling for the pool is vital for "Gbam" stability
pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err); //TODO: MODIFY THIS USING LOGGER AND
  process.exit(-1);
});

export const db = drizzle(pool, { schema });
