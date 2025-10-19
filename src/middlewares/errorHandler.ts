import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { StatusCodes } from '../utils/httpStatus';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  console.error('[Error Handler]', err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Internal server error',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
