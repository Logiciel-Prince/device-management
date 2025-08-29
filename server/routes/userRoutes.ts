import { Router } from "express";
import { storage } from "../storage";
import { requireAdmin, requireOwnershipOrAdmin } from "../middleware/auth";
import {
    validateBody,
    validateParams,
    idParamSchema,
} from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all users (admin only)
router.get(
    "/",
    requireAdmin,
    asyncHandler(async (req: any, res) => {
        const users = await storage.getAllUsers();
        res.json(users);
    })
);

// Update user profile
const updateUserSchema = insertUserSchema
    .pick({
        firstName: true,
        lastName: true,
        email: true,
        role: true,
    })
    .partial();

router.put(
    "/:id",
    validateParams(idParamSchema),
    validateBody(updateUserSchema),
    requireOwnershipOrAdmin,
    asyncHandler(async (req: any, res) => {
        const { id } = req.params;
        const updates = req.body;

        // Regular users can't update role
        if (req.currentUser.role !== "admin") {
            delete updates.role;
        }

        const updatedUser = await storage.updateUser(id, updates);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    })
);

export default router;
