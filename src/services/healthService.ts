import { db } from "../db";
import { sql } from "drizzle-orm";
import { redisClient } from "../utils/redis";

interface SuccessfulCheck {
  status: string;
  latency: string;
  usedMemory?: string | undefined;
}

interface FailedCheck {
  status: string;
  error: string;
}

const checkPostgres: () => Promise<
  SuccessfulCheck | FailedCheck
> = async () => {
  const start = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    return {
      status: "up",
      latency: `${Date.now() - start}ms`,
    };
  } catch (err: any) {
    return {
      status: "down",
      error: err instanceof Error ? err.message : "Unknown Error!!!",
    };
  }
};

const checkRedis: () => Promise<SuccessfulCheck | FailedCheck> = async () => {
  const start = Date.now();
  try {
    const response = await redisClient.ping();
    const info = await redisClient.info("memory");
    const usedMemory = info.match(/used_memory_human:(.*)/)?.[1];

    return {
      status: response === "PONG" ? "up" : "down",
      latency: `${Date.now() - start}ms`,
      usedMemory,
    };
  } catch (err: any) {
    return {
      status: "down",
      error: "Redis unreachable",
    };
  }
};

export { checkPostgres, checkRedis };
