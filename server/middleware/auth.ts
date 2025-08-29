import type { RequestHandler } from "express";
import { storage } from "../storage";

// Enhanced authentication middleware with role-based access
export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};

export const requireAdmin: RequestHandler = async (req: any, res, next) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await storage.getUser(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.currentUser = user; // Cache user for subsequent use
        next();
    } catch (error) {
        console.error("Admin check error:", error);
        res.status(500).json({ message: "Authorization check failed" });
    }
};

export const requireOwnershipOrAdmin: RequestHandler = async (
    req: any,
    res,
    next
) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await storage.getUser(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const targetUserId = req.params.id || req.params.userId;
        if (user.role === "admin" || user.id === targetUserId) {
            req.currentUser = user;
            return next();
        }

        res.status(403).json({
            message:
                "Can only access your own resources or admin access required",
        });
    } catch (error) {
        console.error("Ownership check error:", error);
        res.status(500).json({ message: "Authorization check failed" });
    }
};
