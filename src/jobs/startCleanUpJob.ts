import cron from "node-cron";
import clearUsedTokens from "../utils/clearUsedTokens.js";
import logger from "../utils/logger.js";

const startCleanUpJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      await clearUsedTokens();
    } catch (err: any) {
      logger.error("Token cleanup failed");
    }
  });
};

export { startCleanUpJob };
