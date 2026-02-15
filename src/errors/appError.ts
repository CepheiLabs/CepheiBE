class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: unknown;

  constructor({
    message,
    statusCode = 500,
    details,
    isOperational = true,
  }: {
    message: string;
    statusCode?: number;
    code?: string;
    details?: unknown;
    isOperational?: boolean;
  }) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
