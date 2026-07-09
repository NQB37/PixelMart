import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

const toZodError = (error: unknown) => {
  if (error instanceof ZodError) {
    return {
      name: "ZodError",
      errors: error.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }
  return error;
};

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      next(toZodError(error));
    }
  };

export const validateQuery =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.query is a recompute-on-access getter in Express 5, so the parsed
      // result can't be written back onto it — stash it on validatedQuery instead
      req.validatedQuery = (await schema.parseAsync(req.query)) as Record<string, unknown>;
      next();
    } catch (error) {
      next(toZodError(error));
    }
  };
