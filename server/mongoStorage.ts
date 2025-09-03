import mongoose from "mongoose";
import { randomUUID } from "crypto";
import { IStorage } from "./storage";
import {
    UserModel,
    DeviceModel,
    RequestModel,
    DeviceLogModel,
    DeviceActivityModel,
} from "./models";
import type {
    User,
    UpsertUser,
    Device,
    InsertDevice,
    Request,
    InsertRequest,
    DeviceLog,
    InsertDeviceLog,
    DeviceActivity,
    InsertDeviceActivity,
    RequestWithUser,
    DeviceWithUser,
} from "@shared/schema";

export class MongoStorage implements IStorage {
    constructor() {
        // Connection is handled globally in server/config/database.ts
    }

    async initialize() {
        // Initialize with admin user if not exists
        await this.initializeAdminUser();
    }

    private async initializeAdminUser() {
        const adminExists = await UserModel.findOne({
            email: "admin@example.com",
        });
        if (!adminExists) {
            await this.upsertUser({
                id: "admin-user",
                email: "admin@example.com",
                firstName: "Admin",
                lastName: "User",
                role: "admin",
            });
        }
    }

    // User operations
    async getUser(id: string): Promise<User | undefined> {
        const user = await UserModel.findById(id).lean();
        return user ? this.mapMongoUser(user) : undefined;
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const user = await UserModel.findOne({ email }).lean();
        return user ? this.mapMongoUser(user) : undefined;
    }

    async getAllUsers(): Promise<User[]> {
        const users = await UserModel.find().lean();
        return users.map(this.mapMongoUser);
    }

    async upsertUser(
        userData: UpsertUser & { passwordHash?: string }
    ): Promise<User> {
        const userId = userData.id || randomUUID();
        const updateData: any = {
            ...userData,
            _id: userId,
            updatedAt: new Date(),
        };

        // Include password hash if provided
        if (userData.passwordHash) {
            updateData.passwordHash = userData.passwordHash;
            updateData.isActive = true;
        }

        const user = await UserModel.findByIdAndUpdate(userId, updateData, {
            upsert: true,
            new: true,
            lean: true,
        });
        return this.mapMongoUser(user);
    }

    async updateUser(
        id: string,
        updates: Partial<
            Pick<User, "firstName" | "lastName" | "email" | "role">
        >
    ): Promise<User | undefined> {
        const user = await UserModel.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, lean: true }
        );
        return user ? this.mapMongoUser(user) : undefined;
    }

    // Device operations
    async getDevices(): Promise<DeviceWithUser[]> {
        const devices = await DeviceModel.find().populate("assignedTo").lean();
        return devices.map((device) => ({
            ...this.mapMongoDevice(device),
            assignedUser: device.assignedTo
                ? this.mapMongoUser(device.assignedTo)
                : undefined,
        }));
    }

    async getDevice(id: string): Promise<DeviceWithUser | undefined> {
        const device = await DeviceModel.findById(id)
            .populate("assignedTo")
            .lean();
        if (!device) return undefined;

        return {
            ...this.mapMongoDevice(device),
            assignedUser: device.assignedTo
                ? this.mapMongoUser(device.assignedTo)
                : undefined,
        };
    }

    async createDevice(deviceData: InsertDevice): Promise<Device> {
        const deviceId = randomUUID();
        const device = await DeviceModel.create({
            ...deviceData,
            _id: deviceId,
        });
        return this.mapMongoDevice(device.toObject());
    }

    async updateDevice(
        id: string,
        updates: Partial<Device>
    ): Promise<Device | undefined> {
        const device = await DeviceModel.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date(), lastActivity: new Date() },
            { new: true, lean: true }
        );
        return device ? this.mapMongoDevice(device) : undefined;
    }

    async deleteDevice(id: string): Promise<boolean> {
        const result = await DeviceModel.findByIdAndDelete(id);
        return !!result;
    }

    async getAvailableDevices(type?: string): Promise<Device[]> {
        const query: any = { status: "available" };
        if (type) query.type = type;

        const devices = await DeviceModel.find(query).lean();
        return devices.map(this.mapMongoDevice);
    }

    // Request operations
    async getRequests(): Promise<RequestWithUser[]> {
        const requests = await RequestModel.find()
            .populate("userId")
            .populate("assignedDeviceId")
            .populate("approvedBy")
            .lean();

        return requests.map((request) => ({
            ...this.mapMongoRequest(request),
            user: this.mapMongoUser(request.userId),
            assignedDevice: request.assignedDeviceId
                ? this.mapMongoDevice(request.assignedDeviceId)
                : undefined,
            approver: request.approvedBy
                ? this.mapMongoUser(request.approvedBy)
                : undefined,
        }));
    }

    async getRequest(id: string): Promise<RequestWithUser | undefined> {
        const request = await RequestModel.findById(id)
            .populate("userId")
            .populate("assignedDeviceId")
            .populate("approvedBy")
            .lean();

        if (!request) return undefined;

        return {
            ...this.mapMongoRequest(request),
            user: this.mapMongoUser(request.userId),
            assignedDevice: request.assignedDeviceId
                ? this.mapMongoDevice(request.assignedDeviceId)
                : undefined,
            approver: request.approvedBy
                ? this.mapMongoUser(request.approvedBy)
                : undefined,
        };
    }

    async createRequest(requestData: InsertRequest): Promise<Request> {
        const requestId = randomUUID();
        const request = await RequestModel.create({
            ...requestData,
            _id: requestId,
        });
        return this.mapMongoRequest(request.toObject());
    }

    async updateRequest(
        id: string,
        updates: Partial<Request>
    ): Promise<Request | undefined> {
        const request = await RequestModel.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, lean: true }
        );
        return request ? this.mapMongoRequest(request) : undefined;
    }

    async getUserRequests(userId: string): Promise<RequestWithUser[]> {
        const requests = await RequestModel.find({ userId })
            .populate("userId")
            .populate("assignedDeviceId")
            .populate("approvedBy")
            .lean();

        return requests.map((request) => ({
            ...this.mapMongoRequest(request),
            user: this.mapMongoUser(request.userId),
            assignedDevice: request.assignedDeviceId
                ? this.mapMongoDevice(request.assignedDeviceId)
                : undefined,
            approver: request.approvedBy
                ? this.mapMongoUser(request.approvedBy)
                : undefined,
        }));
    }

    // Device log operations
    async createDeviceLog(logData: InsertDeviceLog): Promise<DeviceLog> {
        const logId = randomUUID();
        const log = await DeviceLogModel.create({
            ...logData,
            _id: logId,
        });
        return this.mapMongoDeviceLog(log.toObject());
    }

    async getDeviceLogs(deviceId: string): Promise<DeviceLog[]> {
        const logs = await DeviceLogModel.find({ deviceId }).lean();
        return logs.map(this.mapMongoDeviceLog);
    }

    // Device activity operations
    async createDeviceActivity(
        activityData: InsertDeviceActivity
    ): Promise<DeviceActivity> {
        const activityId = randomUUID();
        const activity = await DeviceActivityModel.create({
            ...activityData,
            _id: activityId,
        });
        return this.mapMongoDeviceActivity(activity.toObject());
    }

    async getDeviceActivity(
        deviceId: string,
        limit: number = 100
    ): Promise<DeviceActivity[]> {
        const activities = await DeviceActivityModel.find({ deviceId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
        return activities.map(this.mapMongoDeviceActivity);
    }

    async getUserDeviceActivity(
        userId: string,
        limit: number = 100
    ): Promise<DeviceActivity[]> {
        const activities = await DeviceActivityModel.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
        return activities.map(this.mapMongoDeviceActivity);
    }

    // Statistics
    async getStats() {
        const [
            totalDevices,
            availableDevices,
            assignedDevices,
            maintenanceDevices,
            pendingRequests,
            activeUsers,
        ] = await Promise.all([
            DeviceModel.countDocuments(),
            DeviceModel.countDocuments({ status: "available" }),
            DeviceModel.countDocuments({ status: "assigned" }),
            DeviceModel.countDocuments({ status: "maintenance" }),
            RequestModel.countDocuments({ status: "pending" }),
            UserModel.countDocuments({ role: "employee" }),
        ]);

        return {
            totalDevices,
            availableDevices,
            assignedDevices,
            maintenanceDevices,
            pendingRequests,
            activeUsers,
        };
    }

    // Helper methods to map MongoDB documents to our types
    private mapMongoUser(mongoUser: any): User {
        return {
            id: mongoUser._id,
            email: mongoUser.email || null,
            firstName: mongoUser.firstName || null,
            lastName: mongoUser.lastName || null,
            profileImageUrl: mongoUser.profileImageUrl || null,
            role: mongoUser.role,
            createdAt: mongoUser.createdAt || null,
            updatedAt: mongoUser.updatedAt || null,
        };
    }

    private mapMongoDevice(mongoDevice: any): Device {
        return {
            id: mongoDevice._id,
            name: mongoDevice.name,
            type: mongoDevice.type,
            model: mongoDevice.model,
            serialNumber: mongoDevice.serialNumber,
            status: mongoDevice.status,
            assignedTo: mongoDevice.assignedTo || null,
            purchaseDate: mongoDevice.purchaseDate || null,
            lastActivity: mongoDevice.lastActivity,
            createdAt: mongoDevice.createdAt || null,
            updatedAt: mongoDevice.updatedAt || null,
        };
    }

    private mapMongoRequest(mongoRequest: any): Request {
        return {
            id: mongoRequest._id,
            userId: mongoRequest.userId,
            deviceType: mongoRequest.deviceType,
            deviceModel: mongoRequest.deviceModel || null,
            reason: mongoRequest.reason || null,
            status: mongoRequest.status,
            approvedBy: mongoRequest.approvedBy || null,
            approvedAt: mongoRequest.approvedAt || null,
            rejectionReason: mongoRequest.rejectionReason || null,
            assignedDeviceId: mongoRequest.assignedDeviceId || null,
            slackMessageTs: mongoRequest.slackMessageTs || null,
            createdAt: mongoRequest.createdAt || null,
            updatedAt: mongoRequest.updatedAt || null,
        };
    }

    private mapMongoDeviceLog(mongoLog: any): DeviceLog {
        return {
            id: mongoLog._id,
            deviceId: mongoLog.deviceId,
            userId: mongoLog.userId || null,
            action: mongoLog.action,
            notes: mongoLog.notes || null,
            createdAt: mongoLog.createdAt || null,
        };
    }

    private mapMongoDeviceActivity(mongoActivity: any): DeviceActivity {
        return {
            id: mongoActivity._id,
            deviceId: mongoActivity.deviceId,
            userId: mongoActivity.userId || null,
            activityType: mongoActivity.activityType,
            appName: mongoActivity.appName || null,
            website: mongoActivity.website || null,
            duration: mongoActivity.duration || null,
            data: mongoActivity.data || null,
            timestamp: mongoActivity.timestamp || null,
            createdAt: mongoActivity.createdAt || null,
        };
    }
}
