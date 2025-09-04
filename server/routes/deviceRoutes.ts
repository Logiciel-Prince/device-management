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

        // Send Slack notification in the original request thread (only if configured)
        try {
            if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
                // Import sendSlackMessage function
                const { sendSlackMessage } = await import("../slack");

                // Find the original request that assigned this device
                const requests = await storage.getRequests();
                console.log(
                    `Debug - Looking for request with deviceId: ${req.params.id}`
                );
                console.log(`Debug - Total requests found: ${requests.length}`);

                const approvedRequests = requests.filter(
                    (r) => r.status === "approved"
                );
                console.log(
                    `Debug - Approved requests: ${approvedRequests.length}`
                );

                const requestsWithDevice = requests.filter(
                    (r) => r.assignedDeviceId === req.params.id
                );
                console.log(
                    `Debug - Requests with this device: ${requestsWithDevice.length}`
                );

                // Show sample of approved requests with devices for debugging
                const sampleRequests = approvedRequests
                    .filter((r) => r.assignedDeviceId)
                    .slice(0, 3);
                console.log("Debug - Sample approved requests with devices:");
                sampleRequests.forEach((r) => {
                    console.log(
                        `Request ${r.id}: assignedDeviceId=${r.assignedDeviceId}, slackMessageTs=${r.slackMessageTs}, slackThreadId=${r.slackThreadId}`
                    );
                });

                const requestsWithSlackTs = requests.filter(
                    (r) => r.slackMessageTs
                );
                console.log(
                    `Debug - Requests with Slack timestamp: ${requestsWithSlackTs.length}`
                );

                // Import thread manager utility
                const { findMostRecentRequestForDevice } = await import(
                    "../threadManager"
                );

                // Find the MOST RECENT approved request for this device
                const originalRequest = findMostRecentRequestForDevice(
                    requests,
                    req.params.id
                );

                if (originalRequest) {
                    // Show which request was selected
                    const allMatchingRequests = requests.filter(
                        (request) =>
                            request.assignedDeviceId === req.params.id &&
                            request.status === "approved" &&
                            request.slackMessageTs
                    );

                    if (allMatchingRequests.length > 1) {
                        console.log(
                            `Debug - Found ${allMatchingRequests.length} matching requests for device ${req.params.id}:`
                        );
                        allMatchingRequests.forEach((req, index) => {
                            const isSelected = req.id === originalRequest.id;
                            console.log(
                                `  ${index + 1}. Request ${req.id}: approved=${
                                    req.approvedAt
                                }, created=${req.createdAt}, threadId=${
                                    req.slackThreadId
                                } ${
                                    isSelected ? "← SELECTED (most recent)" : ""
                                }`
                            );
                        });
                    } else {
                        console.log(
                            `Debug - Found single matching request: ${originalRequest.id}`
                        );
                    }
                }

                if (originalRequest) {
                    // If no thread ID, try to generate one
                    if (
                        !originalRequest.slackThreadId &&
                        originalRequest.slackMessageTs
                    ) {
                        console.log(
                            "Request found but missing thread ID, generating one..."
                        );
                        const threadId = `req_${originalRequest.id}`;

                        // Update the request with thread ID
                        await storage.updateRequest(originalRequest.id, {
                            slackThreadId: threadId,
                        });

                        originalRequest.slackThreadId = threadId;
                        console.log(
                            `Generated thread ID: ${threadId} for request: ${originalRequest.id}`
                        );
                    }

                    console.log(
                        "Sending device return message with thread ID:",
                        originalRequest.slackThreadId,
                        "and thread_ts:",
                        originalRequest.slackMessageTs
                    );
                    await sendSlackMessage({
                        channel: process.env.SLACK_CHANNEL_ID,
                        text: `🔄 Device returned by ${user.firstName} ${user.lastName}\n📱 Device: ${device.name} (${device.type})`,
                        thread_ts: originalRequest.slackMessageTs,
                    });
                } else {
                    console.log(
                        "No original request found for device return, sending standalone message"
                    );
                    await sendSlackMessage({
                        channel: process.env.SLACK_CHANNEL_ID,
                        text: `🔄 Device returned by ${user.firstName} ${user.lastName}\n📱 Device: ${device.name} (${device.type})`,
                    });
                }
            }
        } catch (slackError) {
            console.error(
                "Failed to send Slack notification for device return:",
                slackError
            );
        }

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
