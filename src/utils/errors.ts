import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(StatusCodes.BAD_REQUEST, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(StatusCodes.NOT_FOUND, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string) {
    super(StatusCodes.FORBIDDEN, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(StatusCodes.CONFLICT, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string) {
    super(StatusCodes.INTERNAL_SERVER_ERROR, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message);
  }
}
