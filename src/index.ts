import express from "express";
import type { Express } from "express";
import { setupSwagger } from "./utils/setUpSwagger";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import logger from "./utils/logger";
const PORT = 5000;
const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: "FRONTEND_URL",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, //One minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, //Ten minutes
  max: 5,
  message: "Too many attempts, try again later.",
});

app.use(express.json());

// *️⃣*️⃣APPLICATION ROUTES*️⃣*️⃣

setupSwagger(app);

app.listen(PORT, () => {
  logger.info(`App running on port ${PORT}...`);
});
