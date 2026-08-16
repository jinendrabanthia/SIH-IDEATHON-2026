import type { Request, Response, NextFunction } from 'express';
/**
 * Express middleware that sanitizes all string values in req.body
 * to prevent stored XSS. Apply before controllers that accept free-text input.
 */
export declare function sanitizeBody(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=sanitize.d.ts.map