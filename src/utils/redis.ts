import { createClient } from "redis";
import logger from "./logger";

// Since you're using camelCase, let's name the variable clearly
export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      //longer wait between each retry
      return Math.min(retries * 50, 2000);
    },
  },
});

//handing events
redisClient.on("error", (err) => logger.error("Redis Error:", err));
redisClient.on("connect", () => logger.info("Redis: Connecting..."));
redisClient.on("ready", () => logger.info("Redis: Connected :)"));
redisClient.on("end", () => logger.info("Redis: Connection Closed :("));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    logger.error("Failed to connect to Redis :(");

    if (process.env.NODE_ENV === "development") {
      console.error("Failed to connect:", err);
    }
  }
};
