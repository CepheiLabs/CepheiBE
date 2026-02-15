import express from "express";
import type { Express } from "express";
import { setupSwagger } from "./utils/setUpSwagger";
import logger from "./utils/logger";

const app: Express = express();

const PORT = 5000;

setupSwagger(app);

app.listen(PORT, () => {
  logger.info(`App running on port ${PORT}`);
});
