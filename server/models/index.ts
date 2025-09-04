import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        email: { type: String, unique: true, sparse: true },
        firstName: { type: String },
        lastName: { type: String },
        profileImageUrl: { type: String },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
            required: true,
            default: "employee",
            enum: ["admin", "employee"],
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Device Schema
const deviceSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        model: { type: String, required: true },
        serialNumber: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (v: string) {
                    return v && v.trim().length > 0;
                },
                message: "Serial number cannot be empty",
            },
        },
        status: {
            type: String,
            required: true,
            default: "available",
            enum: ["available", "assigned", "maintenance"],
        },
        assignedTo: { type: String, ref: "User" },
        purchaseDate: { type: Date },
        lastActivity: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Request Schema
const requestSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        userId: { type: String, required: true, ref: "User" },
        deviceType: { type: String, required: true },
        deviceModel: { type: String },
        reason: { type: String },
        status: {
            type: String,
            required: true,
            default: "pending",
            enum: ["pending", "approved", "rejected"],
        },
        approvedBy: { type: String, ref: "User" },
        approvedAt: { type: Date },
        rejectionReason: { type: String },
        assignedDeviceId: { type: String, ref: "Device" },
        slackThreadId: { type: String }, // Unique thread ID for Slack message threading
        slackMessageTs: { type: String }, // Slack message timestamp for threading (backward compatibility)
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Device Log Schema
const deviceLogSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        deviceId: { type: String, required: true, ref: "Device" },
        userId: { type: String, ref: "User" },
        action: { type: String, required: true },
        notes: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Device Activity Schema
const deviceActivitySchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        deviceId: { type: String, required: true, ref: "Device" },
        userId: { type: String, ref: "User" },
        activityType: { type: String, required: true },
        appName: { type: String },
        website: { type: String },
        duration: { type: String },
        data: { type: String },
        timestamp: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

// Create models
export const UserModel = mongoose.model("User", userSchema);
export const DeviceModel = mongoose.model("Device", deviceSchema);
export const RequestModel = mongoose.model("Request", requestSchema);
export const DeviceLogModel = mongoose.model("DeviceLog", deviceLogSchema);
export const DeviceActivityModel = mongoose.model(
    "DeviceActivity",
    deviceActivitySchema
);
