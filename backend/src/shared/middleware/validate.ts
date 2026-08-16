import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Express middleware factory: validates req[target] against a Zod schema.
 * Rejects with 400 + structured field errors on failure.
 * @param schema  Zod schema to validate against
 * @param target  Which part of the request to validate (default: 'body')
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Write back the parsed (and coerced) values
      if (target === 'body') req.body = parsed;
      else if (target === 'query') (req as unknown as Record<string, unknown>).query = parsed;
      else if (target === 'params') (req as unknown as Record<string, unknown>).params = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid request ${target}`,
            details: err.flatten().fieldErrors,
          },
        });
        return;
      }
      next(err);
    }
  };
}
