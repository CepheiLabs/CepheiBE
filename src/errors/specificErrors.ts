import AppError from "./appError";

class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(404, message);
  }
}

class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden!!!") {
    super(403, message);
  }
}

class ConflictError extends AppError {
  constructor(message: string = "Conflict!!!") {
    super(409, message);
  }
}

class InternalServerError extends AppError {
  constructor(message: string = "Internal Server Error!!!") {
    super(500, message);
  }
}

class ValidationError extends AppError {
  constructor(message: string = "Validation Failed!!!") {
    super(400, message);
  }
}

class BadRequestError extends AppError {
  constructor(message: string = "Bad Request!!!") {
    super(400, message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = "User Unauthorized") {
    super(401, message);
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
