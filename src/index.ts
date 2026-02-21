import express from "express";
import type { Express } from "express";
import { setupSwagger } from "./utils/setUpSwagger";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import logger from "./utils/logger";

import authRouter from "./routes/authRoutes";
import playerRouter from "./routes/playerRoutes";
import errorHandler from "./middlewares/errorHandler";
import { connectRedis } from "./utils/redis";

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
  max: 200,
  message: "Too many attempts, try again later.",
});

app.use(express.json());
app.use(cookieParser());

// *️⃣*️⃣APPLICATION ROUTES*️⃣*️⃣
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/player", playerRouter);

setupSwagger(app);

app.use(errorHandler);

const startServer = async () => {
  // 1. Connect to drizzle/postgres
  // 2. Connect to redis
  await connectRedis();

  app.listen(PORT, () => {
    logger.info(`App running on port ${PORT}...`);
    logger.warn("Remember to change auth rate limiting from 200 requests...");
    logger.warn("Add wallet address to JWT for some routes auth...");
  });
};

startServer();

// TODO: NEXT UP IS PLAYER CONTROLLER WITH GET/ME PATCH/UPDATE_USERNAME AND GET/STATS
