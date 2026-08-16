import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema } from 'zod';
type ValidationTarget = 'body' | 'query' | 'params';
/**
 * Express middleware factory: validates req[target] against a Zod schema.
 * Rejects with 400 + structured field errors on failure.
 * @param schema  Zod schema to validate against
 * @param target  Which part of the request to validate (default: 'body')
 */
export declare function validate(schema: ZodSchema, target?: ValidationTarget): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map