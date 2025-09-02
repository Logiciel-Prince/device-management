import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { sendSlackMessage } from "./slack";
import {
    insertDeviceSchema,
    insertRequestSchema,
    insertDeviceLogSchema,
    insertDeviceActivitySchema,
    insertUserSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
    // Test endpoint to verify API routing works
    app.get("/api/health", (req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // Auth middleware
    await setupAuth(app);

    // Auth routes are now handled in localAuth.ts

    // Integration status endpoint
    app.get("/api/integrations/status", isAuthenticated, (req, res) => {
        const slackConfigured = !!(
            process.env.SLACK_BOT_TOKEN &&
            process.env.SLACK_CHANNEL_ID &&
            process.env.SLACK_BOT_TOKEN !== "your-slack-bot-token" &&
            process.env.SLACK_CHANNEL_ID !== "your-slack-channel-id"
        );

        res.json({
            slack: {
                configured: slackConfigured,
                status: slackConfigured ? "active" : "inactive",
            },
        });
    });

    // Debug endpoint to list Slack channels (admin only)
    app.get("/api/slack/channels", isAuthenticated, async (req, res) => {
        try {
            // Only allow admins to access this debug endpoint
            if (req.user?.role !== 'admin') {
                return res.status(403).json({ message: "Admin access required" });
            }

            if (!process.env.SLACK_BOT_TOKEN) {
                return res.status(400).json({ message: "Slack not configured" });
            }

            const { WebClient } = await import("@slack/web-api");
            const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
            
            const result = await slack.conversations.list({
                types: "public_channel,private_channel",
                limit: 100
            });

            const channels = result.channels?.map(channel => ({
                id: channel.id,
                name: channel.name,
                is_member: channel.is_member,
                is_private: channel.is_private
            })) || [];

            res.json({ channels });
        } catch (error: any) {
            console.error("Error listing Slack channels:", error);
            res.status(500).json({ 
                message: "Failed to list channels",
                error: error.message 
            });
        }
    });

    // Get all users (admin only)
    app.get("/api/users", isAuthenticated, async (req: any, res) => {
        try {
            const currentUser = await storage.getUser(req.user.id);
            if (!currentUser || currentUser.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin access required" });
            }

            const users = await storage.getAllUsers();
            res.json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Failed to fetch users" });
        }
    });

    // User profile endpoint
    app.put("/api/users/:id", isAuthenticated, async (req: any, res) => {
        try {
            const userId = req.params.id;
            const currentUser = await storage.getUser(req.user.id);

            // Users can update their own profile, or admins can update any user
            if (currentUser?.id !== userId && currentUser?.role !== "admin") {
                return res.status(403).json({
                    message:
                        "Can only update your own profile or admin access required",
                });
            }

            let updateSchema;
            if (currentUser?.role === "admin") {
                // Admins can update role as well
                updateSchema = insertUserSchema.pick({
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                });
            } else {
                // Regular users can only update basic profile info
                updateSchema = insertUserSchema.pick({
                    firstName: true,
                    lastName: true,
                    email: true,
                });
            }

            const validatedData = updateSchema.parse(req.body);
            const updatedUser = await storage.updateUser(userId, validatedData);

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(updatedUser);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid user data",
                    errors: error.errors,
                });
            }
            console.error("Error updating user:", error);
            res.status(500).json({ message: "Failed to update user" });
        }
    });

    // Stats endpoint
    app.get("/api/stats", isAuthenticated, async (req, res) => {
        try {
            const stats = await storage.getStats();
            res.json(stats);
        } catch (error) {
            console.error("Error fetching stats:", error);
            res.status(500).json({ message: "Failed to fetch stats" });
        }
    });

    // Device endpoints
    app.get("/api/devices", isAuthenticated, async (req, res) => {
        try {
            const devices = await storage.getDevices();
            res.json(devices);
        } catch (error) {
            console.error("Error fetching devices:", error);
            res.status(500).json({ message: "Failed to fetch devices" });
        }
    });

    app.get("/api/devices/available", isAuthenticated, async (req, res) => {
        try {
            const type = req.query.type as string;
            const devices = await storage.getAvailableDevices(type);
            res.json(devices);
        } catch (error) {
            console.error("Error fetching available devices:", error);
            res.status(500).json({
                message: "Failed to fetch available devices",
            });
        }
    });

    app.get("/api/devices/:id", isAuthenticated, async (req, res) => {
        try {
            const device = await storage.getDevice(req.params.id);
            if (!device) {
                return res.status(404).json({ message: "Device not found" });
            }
            res.json(device);
        } catch (error) {
            console.error("Error fetching device:", error);
            res.status(500).json({ message: "Failed to fetch device" });
        }
    });

    app.post("/api/devices", isAuthenticated, async (req: any, res) => {
        try {
            const user = await storage.getUser(req.user.id);
            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin access required" });
            }

            const validatedData = insertDeviceSchema.parse(req.body);
            const device = await storage.createDevice(validatedData);

            // Log device creation
            await storage.createDeviceLog({
                deviceId: device.id,
                userId: user.id,
                action: "created",
                notes: `Device ${device.name} added to inventory`,
            });

            res.status(201).json(device);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid device data",
                    errors: error.errors,
                });
            }

            // Handle MongoDB validation errors
            if (error.name === "ValidationError") {
                const validationErrors = Object.values(error.errors).map(
                    (err: any) => ({
                        field: err.path,
                        message: err.message,
                    })
                );
                return res.status(400).json({
                    message: "Device validation failed",
                    errors: validationErrors,
                });
            }

            // Handle duplicate key errors (unique constraint violations)
            if (error.code === 11000) {
                const field = Object.keys(error.keyPattern)[0];
                return res.status(409).json({
                    message: `A device with this ${field} already exists`,
                });
            }

            console.error("Error creating device:", error);
            res.status(500).json({ message: "Failed to create device" });
        }
    });

    app.put("/api/devices/:id", isAuthenticated, async (req: any, res) => {
        try {
            const user = await storage.getUser(req.user.id);
            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin access required" });
            }

            const updates = req.body;
            const device = await storage.updateDevice(req.params.id, updates);
            if (!device) {
                return res.status(404).json({ message: "Device not found" });
            }

            // Log device update
            await storage.createDeviceLog({
                deviceId: device.id,
                userId: user.id,
                action: "updated",
                notes: `Device ${device.name} updated`,
            });

            res.json(device);
        } catch (error) {
            console.error("Error updating device:", error);
            res.status(500).json({ message: "Failed to update device" });
        }
    });

    app.delete("/api/devices/:id", isAuthenticated, async (req: any, res) => {
        try {
            const user = await storage.getUser(req.user.id);
            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin access required" });
            }

            const success = await storage.deleteDevice(req.params.id);
            if (!success) {
                return res.status(404).json({ message: "Device not found" });
            }

            res.json({ message: "Device deleted successfully" });
        } catch (error) {
            console.error("Error deleting device:", error);
            res.status(500).json({ message: "Failed to delete device" });
        }
    });

    // Request endpoints
    app.get("/api/requests", isAuthenticated, async (req: any, res) => {
        try {
            const user = await storage.getUser(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            let requests;
            if (user.role === "admin") {
                requests = await storage.getRequests();
            } else {
                requests = await storage.getUserRequests(user.id);
            }

            res.json(requests);
        } catch (error) {
            console.error("Error fetching requests:", error);
            res.status(500).json({ message: "Failed to fetch requests" });
        }
    });

    app.post("/api/requests", isAuthenticated, async (req: any, res) => {
        try {
            const user = await storage.getUser(req.user.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const validatedData = insertRequestSchema.parse({
                ...req.body,
                userId: user.id,
            });

            const request = await storage.createRequest(validatedData);

            // Send Slack notification
            try {
                await sendSlackMessage({
                    channel: process.env.SLACK_CHANNEL_ID!,
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: "*New Device Request* :smartphone:",
                            },
                        },
                        {
                            type: "section",
                            fields: [
                                {
                                    type: "mrkdwn",
                                    text: `*Employee:* ${user.firstName} ${user.lastName}`,
                                },
                                {
                                    type: "mrkdwn",
                                    text: `*Device:* ${request.deviceType} ${
                                        request.deviceModel || ""
                                    }`,
                                },
                                {
                                    type: "mrkdwn",
                                    text: `*Reason:* ${
                                        request.reason || "Not specified"
                                    }`,
                                },
                                {
                                    type: "mrkdwn",
                                    text: `*Request ID:* ${request.id}`,
                                },
                            ],
                        },
                    ],
                });
            } catch (slackError) {
                console.error("Failed to send Slack notification:", slackError);
                // Don't fail the request if Slack fails
            }

            res.status(201).json(request);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    message: "Invalid request data",
                    errors: error.errors,
                });
            }
            console.error("Error creating request:", error);
            res.status(500).json({ message: "Failed to create request" });
        }
    });

    app.put(
        "/api/requests/:id/approve",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const user = await storage.getUser(req.user.id);
                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin access required" });
                }

                const { deviceId } = req.body;
                const request = await storage.getRequest(req.params.id);
                if (!request) {
                    return res
                        .status(404)
                        .json({ message: "Request not found" });
                }

                // Update request status
                const updatedRequest = await storage.updateRequest(
                    req.params.id,
                    {
                        status: "approved",
                        approvedBy: user.id,
                        approvedAt: new Date(),
                        assignedDeviceId: deviceId,
                    }
                );

                // Assign device if provided
                if (deviceId) {
                    await storage.updateDevice(deviceId, {
                        status: "assigned",
                        assignedTo: request.userId,
                    });

                    // Log device assignment
                    await storage.createDeviceLog({
                        deviceId,
                        userId: request.userId,
                        action: "assigned",
                        notes: `Device assigned via request ${request.id}`,
                    });
                }

                // Send Slack notification
                try {
                    await sendSlackMessage({
                        channel: process.env.SLACK_CHANNEL_ID!,
                        text: `✅ Device request approved for ${request.user.firstName} ${request.user.lastName}`,
                    });
                } catch (slackError) {
                    console.error(
                        "Failed to send Slack notification:",
                        slackError
                    );
                }

                res.json(updatedRequest);
            } catch (error) {
                console.error("Error approving request:", error);
                res.status(500).json({ message: "Failed to approve request" });
            }
        }
    );

    app.put(
        "/api/requests/:id/reject",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const user = await storage.getUser(req.user.id);
                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin access required" });
                }

                const { reason } = req.body;
                const request = await storage.getRequest(req.params.id);
                if (!request) {
                    return res
                        .status(404)
                        .json({ message: "Request not found" });
                }

                const updatedRequest = await storage.updateRequest(
                    req.params.id,
                    {
                        status: "rejected",
                        approvedBy: user.id,
                        approvedAt: new Date(),
                        rejectionReason: reason,
                    }
                );

                // Send Slack notification
                try {
                    await sendSlackMessage({
                        channel: process.env.SLACK_CHANNEL_ID!,
                        text: `❌ Device request rejected for ${
                            request.user.firstName
                        } ${request.user.lastName}. Reason: ${
                            reason || "Not specified"
                        }`,
                    });
                } catch (slackError) {
                    console.error(
                        "Failed to send Slack notification:",
                        slackError
                    );
                }

                res.json(updatedRequest);
            } catch (error) {
                console.error("Error rejecting request:", error);
                res.status(500).json({ message: "Failed to reject request" });
            }
        }
    );

    // Device return endpoint
    app.put(
        "/api/devices/:id/return",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const user = await storage.getUser(req.user.id);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                const device = await storage.getDevice(req.params.id);
                if (!device) {
                    return res
                        .status(404)
                        .json({ message: "Device not found" });
                }

                // Only admin or assigned user can return device
                if (user.role !== "admin" && device.assignedTo !== user.id) {
                    return res.status(403).json({
                        message: "Not authorized to return this device",
                    });
                }

                const updatedDevice = await storage.updateDevice(
                    req.params.id,
                    {
                        status: "available",
                        assignedTo: null,
                    }
                );

                // Log device return
                await storage.createDeviceLog({
                    deviceId: req.params.id,
                    userId: user.id,
                    action: "returned",
                    notes: `Device returned by ${user.firstName} ${user.lastName}`,
                });

                res.json(updatedDevice);
            } catch (error) {
                console.error("Error returning device:", error);
                res.status(500).json({ message: "Failed to return device" });
            }
        }
    );

    // Device logs endpoint
    app.get("/api/devices/:id/logs", isAuthenticated, async (req: any, res) => {
        try {
            const user = await storage.getUser(req.user.id);
            if (!user || user.role !== "admin") {
                return res
                    .status(403)
                    .json({ message: "Admin access required" });
            }

            const logs = await storage.getDeviceLogs(req.params.id);
            res.json(logs);
        } catch (error) {
            console.error("Error fetching device logs:", error);
            res.status(500).json({ message: "Failed to fetch device logs" });
        }
    });

    // Device activity tracking endpoints (for parental controls)
    app.post(
        "/api/devices/:id/activity",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const validatedData = insertDeviceActivitySchema.parse({
                    ...req.body,
                    deviceId: req.params.id,
                });

                const activity = await storage.createDeviceActivity(
                    validatedData
                );
                res.status(201).json(activity);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return res.status(400).json({
                        message: "Invalid activity data",
                        errors: error.errors,
                    });
                }
                console.error("Error logging device activity:", error);
                res.status(500).json({
                    message: "Failed to log device activity",
                });
            }
        }
    );

    app.get(
        "/api/devices/:id/activity",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const user = await storage.getUser(req.user.id);
                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin access required" });
                }

                const limit = req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 100;
                const activities = await storage.getDeviceActivity(
                    req.params.id,
                    limit
                );
                res.json(activities);
            } catch (error) {
                console.error("Error fetching device activity:", error);
                res.status(500).json({
                    message: "Failed to fetch device activity",
                });
            }
        }
    );

    app.get(
        "/api/users/:id/activity",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const user = await storage.getUser(req.user.id);
                if (!user || user.role !== "admin") {
                    return res
                        .status(403)
                        .json({ message: "Admin access required" });
                }

                const limit = req.query.limit
                    ? parseInt(req.query.limit as string)
                    : 100;
                const activities = await storage.getUserDeviceActivity(
                    req.params.id,
                    limit
                );
                res.json(activities);
            } catch (error) {
                console.error("Error fetching user device activity:", error);
                res.status(500).json({
                    message: "Failed to fetch user device activity",
                });
            }
        }
    );

    // Configure multer for profile image uploads
    const storage_multer = multer.memoryStorage();
    const upload = multer({
        storage: storage_multer,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/")) {
                cb(null, true);
            } else {
                cb(new Error("Only image files are allowed"));
            }
        },
    });

    // Profile image upload endpoint
    app.post(
        "/api/users/:id/profile-image",
        isAuthenticated,
        upload.single("profileImage"),
        async (req: any, res) => {
            try {
                const user = await storage.getUser(req.user.id);
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }

                // Only allow users to update their own profile or admins to update any profile
                if (user.id !== req.params.id && user.role !== "admin") {
                    return res.status(403).json({ message: "Access denied" });
                }

                if (!req.file) {
                    return res
                        .status(400)
                        .json({ message: "No image file provided" });
                }

                // Create uploads directory if it doesn't exist
                const uploadsDir = join(
                    process.cwd(),
                    "uploads",
                    "profile-images"
                );
                if (!existsSync(uploadsDir)) {
                    mkdirSync(uploadsDir, { recursive: true });
                }

                // Generate unique filename
                const timestamp = Date.now();
                const filename = `${req.params.id}-${timestamp}.jpg`;
                const filepath = join(uploadsDir, filename);

                // Save file to disk
                writeFileSync(filepath, req.file.buffer);

                // Update user profile with image URL
                const imageUrl = `/uploads/profile-images/${filename}`;
                const updatedUser = await storage.updateUser(req.params.id, {
                    profileImageUrl: imageUrl,
                });

                if (!updatedUser) {
                    return res.status(404).json({ message: "User not found" });
                }

                res.json({
                    message: "Profile image updated successfully",
                    profileImageUrl: imageUrl,
                });
            } catch (error) {
                console.error("Error uploading profile image:", error);
                res.status(500).json({
                    message: "Failed to upload profile image",
                });
            }
        }
    );

    const httpServer = createServer(app);
    return httpServer;
}
