import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory: validates req.body against a Zod schema.
 * Rejects with 400 + structured field errors on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: err.flatten().fieldErrors,
          },
        });
        return;
      }
      next(err);
    }
  };
}
