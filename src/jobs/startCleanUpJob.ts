import cron from "node-cron";
import clearUsedTokens from "../utils/clearUsedTokens";
import logger from "../utils/logger";

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
