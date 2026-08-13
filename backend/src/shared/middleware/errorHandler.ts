import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types/index.js';

/**
 * Global error handler — no raw stack traces leak to the client.
 * All errors are wrapped in the standard ApiResponse envelope.
 */
export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';

  console.error(`[ERROR] ${code}:`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const response: ApiResponse<null> = {
    error: {
      code,
      message:
        statusCode === 500
          ? 'An internal error occurred. Please try again later.'
          : err.message,
    },
  };

  res.status(statusCode).json(response);
}

/**
 * Typed app error for consistent error handling throughout the app.
 */
export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}
