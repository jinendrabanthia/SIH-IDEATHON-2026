import type { Request, Response, NextFunction } from 'express';
/**
 * Global error handler — no raw stack traces leak to the client.
 * All errors are wrapped in the standard ApiResponse envelope.
 */
export declare function errorHandler(err: Error & {
    statusCode?: number;
    code?: string;
}, _req: Request, res: Response, _next: NextFunction): void;
/**
 * Typed app error for consistent error handling throughout the app.
 */
export declare class AppError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode: number, code: string);
}
//# sourceMappingURL=errorHandler.d.ts.map