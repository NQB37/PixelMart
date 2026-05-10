import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import { AppError } from '../utils/app-error.js';

export const validateRequest =
  (schema: z.ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
      headers: req.headers,
    });

    if (!result.success) {
      return next(new AppError(400, 'Validation failed', result.error.flatten()));
    }

    Object.assign(req, result.data);
    return next();
  };
