import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Handle specific error types
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation error",
            errors: err.errors,
        });
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID format",
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            message: "Duplicate entry",
            field: Object.keys(err.keyPattern)[0],
        });
    }

    // Default error response
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
