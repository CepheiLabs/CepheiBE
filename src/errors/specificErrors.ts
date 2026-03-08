import AppError from "./appError";

class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details?: unknown) {
    super({ statusCode: 404, message, details });
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden!!!", details?: unknown) {
    super({ statusCode: 403, message, details });
  }
}

class ConflictError extends AppError {
  constructor(message: string = "Conflict!!!", details?: unknown) {
    super({ statusCode: 409, message, details });
  }
}

class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error!!!", details?: unknown) {
    super({ statusCode: 500, message, details });
  }
}

class ValidationError extends AppError {
  constructor(message: string = "Validation Failed!!!", details?: unknown) {
    super({ statusCode: 400, message, details });
  }
}

class BadRequestError extends AppError {
  constructor(message: string = "Bad Request!!!", details?: unknown) {
    super({ statusCode: 400, message, details });
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = "User Unauthorized", details?: unknown) {
    super({ statusCode: 401, message, details });
  }
}

export {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  InternalServerError,
  ValidationError,
  UnauthorizedError,
  BadRequestError,
};
