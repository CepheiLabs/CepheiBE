import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors";
import logger from "../utils/logger";

interface ErrorResponse {
  status: string;
  message: string;
  details?: unknown;
  stack?: string;
}

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  //Below logic groups all errors not accounted for as a server error
  const statusCode: number = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error!!!";

  //coming here
  if (!(err instanceof AppError && err.isOperational)) {
    logger.error(err);
  }

  const response: ErrorResponse = { status: "error", message };

  if (err.details) {
    response.details = err.details;
  }

  if (process.env.NODE_ENV !== "production") {
    response.stack = err.stack;
  }
  res.status(statusCode).json(response);
};

export default errorHandler;
