import { config } from "dotenv";
import pino from "pino";

config();

const isDev: boolean =
  (process.env.NODE_ENV?.trim() as string) !== "production";

const logger = isDev
  ? pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    })
  : pino();

export default logger;
