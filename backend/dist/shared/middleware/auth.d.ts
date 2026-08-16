import type { Request, Response, NextFunction } from 'express';
export declare const ACCESS_TOKEN_EXPIRY = "15m";
export declare const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export interface AuthPayload {
    userId: string;
    email: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
/**
 * Strict auth middleware — rejects unauthenticated requests with 401.
 * In MVP dev mode (JWT_SECRET starts with dev placeholder), it logs a warning
 * but still enforces if a token is provided.
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Optional auth — attaches user if token is valid, but doesn't reject.
 * Useful for public endpoints that behave differently for logged-in users.
 */
export declare function optionalAuth(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map