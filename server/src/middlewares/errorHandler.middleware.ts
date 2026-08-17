import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError';
import { env } from '@/config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Known operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues,
    });
  }

  console.error('Unhandled Error:', err);
  return res.status(500).json({
    success: false,
    message:
      env.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
};
