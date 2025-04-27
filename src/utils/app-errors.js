const STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

/**
 * Base Error Class
 */
class AppError extends Error {
  constructor(
    name,
    statusCode,
    description,
    message,
    isOperational = true,
    errorStack = null,
    loggingErrorResponse = null
  ) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.description = description;
    this.message = message;
    this.isOperational = isOperational; // Determines if error is user-triggered
    this.errorStack = errorStack;
    this.logError = loggingErrorResponse;

    // Capture the error stack trace for debugging
    Error.captureStackTrace(this);
  }
}

/**
 * API-Specific Error
 */
class APIError extends AppError {
  constructor(
    description = "Internal Server Error",
    errMessage = "", // Accepts an error message
    isOperational = true
  ) {
    super("API Error", STATUS_CODES.INTERNAL_ERROR, description, errMessage, isOperational);
  }
}

/**
 * 400 - Bad Request Error
 */
class BadRequestError extends AppError {
  constructor(
    description = "Bad Request",
    errMessage = "", // Accepts an error message
    isOperational = true
  ) {
    super("Bad Request", STATUS_CODES.BAD_REQUEST, description, errMessage, isOperational);
  }
}

/**
 * 401 - Unauthorized Error
 */
class UnauthorizedError extends AppError {
  constructor(
    description = "Unauthorized Access",
    errMessage = "", // Accepts an error message
    isOperational = true
  ) {
    super("Unauthorized", STATUS_CODES.UNAUTHORIZED, description, errMessage, isOperational);
  }
}

/**
 * 403 - Forbidden Error
 */
class ForbiddenError extends AppError {
  constructor(
    description = "Forbidden Access",
    errMessage = "", // Accepts an error message
    isOperational = true
  ) {
    super("Forbidden", STATUS_CODES.FORBIDDEN, description, errMessage, isOperational);
  }
}

/**
 * 404 - Not Found Error
 */
class NotFoundError extends AppError {
  constructor(
    description = "Resource Not Found",
    errMessage = "", // Accepts an error message
    isOperational = true
  ) {
    super("Not Found", STATUS_CODES.NOT_FOUND, description, errMessage, isOperational);
  }
}

/**
 * 409 - Conflict Error
 */
class ConflictError extends AppError {
  constructor(
    description = "Conflict Occurred",
    errMessage = "", // Accepts an error message
    isOperational = true
  ) {
    super("Conflict", STATUS_CODES.CONFLICT, description, errMessage, isOperational);
  }
}

/**
 * 500 - Internal Server Error
 */
class InternalServerError extends AppError {
  constructor(
    description = "Internal Server Error",
    errMessage = "", // Accepts an error message
    isOperational = false // Typically not operational
  ) {
    super("Internal Error", STATUS_CODES.INTERNAL_ERROR, description, errMessage, isOperational);
  }
}

/**
 * 503 - Service Unavailable Error
 */
class ServiceUnavailableError extends AppError {
  constructor(
    description = "Service Unavailable",
    errMessage = "", // Accepts an error message
    isOperational = false // Typically not operational
  ) {
    super("Service Unavailable", STATUS_CODES.INTERNAL_ERROR, description, errMessage, isOperational);
  }
}

module.exports = {
  STATUS_CODES,
  AppError,
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  ServiceUnavailableError,
};
