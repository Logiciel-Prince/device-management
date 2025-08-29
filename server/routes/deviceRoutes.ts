import { Router } from "express";
import { storage } from "../storage";
import { isAuthenticated, requireAdmin } from "../middleware/auth";
import {
    validateBody,
    validateParams,
    validateQuery,
    idParamSchema,
} from "../middleware/validation";
import { asyncHandler } from "../middleware/errorHandler";
import { insertDeviceSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all devices
router.get(
    "/",
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const devices = await storage.getDevices();
        res.json(devices);
    })
);

// Get available devices with optional type filter
const availableDevicesQuery = z.object({
    type: z.string().optional(),
});

router.get(
    "/available",
    validateQuery(availableDevicesQuery),
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
        const { type } = req.query;
        const devices = await storage.getAvailableDevices(type);
        res.json(devices);
    })
);

// Get single device
router.get(
    "/:id",
    validateParams(idParamSchema),
    isAuthenticated,
    asyncHandler(async (req, res) => {
        const device = await storage.getDevice(req.params.id);
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }
        res.json(device);
    })
);

// Create device (admin only)
router.post(
    "/",
    validateBody(insertDeviceSchema),
    requireAdmin,
    asyncHandler(async (req: any, res) => {
        const device = await storage.createDevice(req.body);

        // Log device creation
        await storage.createDeviceLog({
            deviceId: device.id,
            userId: req.currentUser.id,
            action: "created",
            notes: `Device ${device.name} added to inventory`,
        });

        res.status(201).json(device);
    })
);

// Update device (admin only)
const updateDeviceSchema = insertDeviceSchema.partial();

router.put(
    "/:id",
    validateParams(idParamSchema),
    validateBody(updateDeviceSchema),
    requireAdmin,
    asyncHandler(async (req: any, res) => {
        const device = await storage.updateDevice(req.params.id, req.body);
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Log device update
        await storage.createDeviceLog({
            deviceId: device.id,
            userId: req.currentUser.id,
            action: "updated",
            notes: `Device ${device.name} updated`,
        });

        res.json(device);
    })
);

// Delete device (admin only)
router.delete(
    "/:id",
    validateParams(idParamSchema),
    requireAdmin,
    asyncHandler(async (req, res) => {
        const success = await storage.deleteDevice(req.params.id);
        if (!success) {
            return res.status(404).json({ message: "Device not found" });
        }
        res.json({ message: "Device deleted successfully" });
    })
);

// Return device
router.put(
    "/:id/return",
    validateParams(idParamSchema),
    isAuthenticated,
    asyncHandler(async (req: any, res) => {
        const user = req.currentUser || (await storage.getUser(req.user.id));
        const device = await storage.getDevice(req.params.id);

        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Only admin or assigned user can return device
        if (user.role !== "admin" && device.assignedTo !== user.id) {
            return res.status(403).json({
                message: "Not authorized to return this device",
            });
        }

        const updatedDevice = await storage.updateDevice(req.params.id, {
            status: "available",
            assignedTo: null,
        });

        // Log device return
        await storage.createDeviceLog({
            deviceId: req.params.id,
            userId: user.id,
            action: "returned",
            notes: `Device returned by ${user.firstName} ${user.lastName}`,
        });

        res.json(updatedDevice);
    })
);

// Get device logs (admin only)
router.get(
    "/:id/logs",
    validateParams(idParamSchema),
    requireAdmin,
    asyncHandler(async (req, res) => {
        const logs = await storage.getDeviceLogs(req.params.id);
        res.json(logs);
    })
);

export default router;
