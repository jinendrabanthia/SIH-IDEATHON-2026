/**
 * Global error handler — no raw stack traces leak to the client.
 * All errors are wrapped in the standard ApiResponse envelope.
 */
export function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode ?? 500;
    const code = err.code ?? 'INTERNAL_ERROR';
    console.error(`[ERROR] ${code}:`, err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }
    const response = {
        error: {
            code,
            message: statusCode === 500
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
    statusCode;
    code;
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'AppError';
    }
}
//# sourceMappingURL=errorHandler.js.map