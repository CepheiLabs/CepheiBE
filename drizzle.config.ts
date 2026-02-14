import { defineConfig } from "drizzle-kit";
import "dotenv";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true,
  strict: true,
});
