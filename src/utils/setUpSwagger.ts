import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../config/swaggerConfig"; // Your config from earlier
import logger from "./logger";

const HOST_URL = process.env.HOST_URL!;

const URL = `${HOST_URL}/api-docs`;

export const setupSwagger = (app: Express): void => {
  // UI page
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  //For importation purposes
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  logger.info(`Swagger Docs available at ${URL}`);
};
