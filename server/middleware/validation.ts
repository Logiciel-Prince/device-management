import { z } from "zod";
import type { RequestHandler } from "express";

// Generic validation middleware
export const validateBody = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid request data",
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
};

// Common validation schemas
export const paginationSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
    id: z.string().min(1),
});

export const validateQuery = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid query parameters",
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
};

export const validateParams = (schema: z.ZodSchema): RequestHandler => {
    return (req, res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid parameters",
                    errors: error.errors,
                });
            }
            next(error);
        }
    };
};
