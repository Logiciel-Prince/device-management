import {
  users,
  devices,
  requests,
  deviceLogs,
  deviceActivity,
  type User,
  type UpsertUser,
  type Device,
  type InsertDevice,
  type Request,
  type InsertRequest,
  type DeviceLog,
  type InsertDeviceLog,
  type DeviceActivity,
  type InsertDeviceActivity,
  type RequestWithUser,
  type DeviceWithUser,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User | undefined>;
  
  // Device operations
  getDevices(): Promise<DeviceWithUser[]>;
  getDevice(id: string): Promise<DeviceWithUser | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined>;
  deleteDevice(id: string): Promise<boolean>;
  getAvailableDevices(type?: string): Promise<Device[]>;
  
  // Request operations
  getRequests(): Promise<RequestWithUser[]>;
  getRequest(id: string): Promise<RequestWithUser | undefined>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined>;
  getUserRequests(userId: string): Promise<RequestWithUser[]>;
  
  // Device log operations
  createDeviceLog(log: InsertDeviceLog): Promise<DeviceLog>;
  getDeviceLogs(deviceId: string): Promise<DeviceLog[]>;
  
  // Device activity operations (for parental controls)
  createDeviceActivity(activity: InsertDeviceActivity): Promise<DeviceActivity>;
  getDeviceActivity(deviceId: string, limit?: number): Promise<DeviceActivity[]>;
  getUserDeviceActivity(userId: string, limit?: number): Promise<DeviceActivity[]>;
  
  // Statistics
  getStats(): Promise<{
    totalDevices: number;
    availableDevices: number;
    assignedDevices: number;
    maintenanceDevices: number;
    pendingRequests: number;
    activeUsers: number;
  }>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private devices = new Map<string, Device>();
  private requests = new Map<string, Request>();
  private deviceLogs = new Map<string, DeviceLog>();
  private deviceActivities = new Map<string, DeviceActivity>();

  constructor() {
    // Initialize with some admin user
    this.upsertUser({
      id: "admin-user",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    });

    // Initialize with sample data for demonstration
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample employee
    const employee = await this.upsertUser({
      id: "employee-001",
      email: "john.doe@company.com",
      firstName: "John",
      lastName: "Doe",
      role: "employee",
    });

    // Create sample device
    const device = await this.createDevice({
      name: "iPhone 13 Pro",
      type: "smartphone",
      model: "128GB Space Gray",
      serialNumber: "ABC123456789",
      status: "assigned",
      assignedTo: employee.id,
      purchaseDate: new Date("2023-01-15"),
    });

    // Create sample device activities for demonstration
    const activities = [
      {
        deviceId: device.id,
        userId: employee.id,
        activityType: "app_usage",
        appName: "Instagram",
        duration: "45",
        data: JSON.stringify({ category: "social", screenTime: "45 minutes" }),
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
      {
        deviceId: device.id,
        userId: employee.id,
        activityType: "website_visit",
        website: "youtube.com",
        duration: "20",
        data: JSON.stringify({ category: "entertainment", title: "Tech Reviews" }),
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        deviceId: device.id,
        userId: employee.id,
        activityType: "call",
        data: JSON.stringify({ contact: "Client Meeting", duration: "15 minutes", type: "outgoing" }),
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      },
      {
        deviceId: device.id,
        userId: employee.id,
        activityType: "app_usage",
        appName: "Slack",
        duration: "30",
        data: JSON.stringify({ category: "productivity", messagesSent: 12 }),
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
      {
        deviceId: device.id,
        userId: employee.id,
        activityType: "location",
        data: JSON.stringify({ location: "Office Building", address: "123 Business St", accuracy: "10m" }),
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      },
    ];

    for (const activityData of activities) {
      await this.createDeviceActivity(activityData);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      role: userData.role || "employee",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email' | 'role'>>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      return undefined;
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Device operations
  async getDevices(): Promise<DeviceWithUser[]> {
    const deviceList = Array.from(this.devices.values());
    return deviceList.map(device => ({
      ...device,
      assignedUser: device.assignedTo ? this.users.get(device.assignedTo) : undefined,
    }));
  }

  async getDevice(id: string): Promise<DeviceWithUser | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;
    
    return {
      ...device,
      assignedUser: device.assignedTo ? this.users.get(device.assignedTo) : undefined,
    };
  }

  async createDevice(deviceData: InsertDevice): Promise<Device> {
    const device: Device = {
      ...deviceData,
      id: randomUUID(),
      status: deviceData.status || "available",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivity: new Date(),
    };
    this.devices.set(device.id, device);
    return device;
  }

  async updateDevice(id: string, updates: Partial<Device>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;

    const updatedDevice = {
      ...device,
      ...updates,
      updatedAt: new Date(),
      lastActivity: new Date(),
    };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: string): Promise<boolean> {
    return this.devices.delete(id);
  }

  async getAvailableDevices(type?: string): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(device => 
      device.status === "available" && (!type || device.type === type)
    );
  }

  // Request operations
  async getRequests(): Promise<RequestWithUser[]> {
    const requestList = Array.from(this.requests.values());
    return requestList.map(request => ({
      ...request,
      user: this.users.get(request.userId)!,
      assignedDevice: request.assignedDeviceId ? this.devices.get(request.assignedDeviceId) : undefined,
      approver: request.approvedBy ? this.users.get(request.approvedBy) : undefined,
    }));
  }

  async getRequest(id: string): Promise<RequestWithUser | undefined> {
    const request = this.requests.get(id);
    if (!request) return undefined;

    return {
      ...request,
      user: this.users.get(request.userId)!,
      assignedDevice: request.assignedDeviceId ? this.devices.get(request.assignedDeviceId) : undefined,
      approver: request.approvedBy ? this.users.get(request.approvedBy) : undefined,
    };
  }

  async createRequest(requestData: InsertRequest): Promise<Request> {
    const request: Request = {
      ...requestData,
      id: randomUUID(),
      status: "pending",
      approvedBy: null,
      approvedAt: null,
      rejectionReason: null,
      assignedDeviceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.requests.set(request.id, request);
    return request;
  }

  async updateRequest(id: string, updates: Partial<Request>): Promise<Request | undefined> {
    const request = this.requests.get(id);
    if (!request) return undefined;

    const updatedRequest = {
      ...request,
      ...updates,
      updatedAt: new Date(),
    };
    this.requests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getUserRequests(userId: string): Promise<RequestWithUser[]> {
    const userRequests = Array.from(this.requests.values()).filter(r => r.userId === userId);
    return userRequests.map(request => ({
      ...request,
      user: this.users.get(request.userId)!,
      assignedDevice: request.assignedDeviceId ? this.devices.get(request.assignedDeviceId) : undefined,
      approver: request.approvedBy ? this.users.get(request.approvedBy) : undefined,
    }));
  }

  // Device log operations
  async createDeviceLog(logData: InsertDeviceLog): Promise<DeviceLog> {
    const log: DeviceLog = {
      ...logData,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.deviceLogs.set(log.id, log);
    return log;
  }

  async getDeviceLogs(deviceId: string): Promise<DeviceLog[]> {
    return Array.from(this.deviceLogs.values()).filter(log => log.deviceId === deviceId);
  }

  // Device activity operations (for parental controls)
  async createDeviceActivity(activityData: InsertDeviceActivity): Promise<DeviceActivity> {
    const activity: DeviceActivity = {
      ...activityData,
      id: randomUUID(),
      createdAt: new Date(),
      timestamp: activityData.timestamp || new Date(),
    };
    this.deviceActivities.set(activity.id, activity);
    return activity;
  }

  async getDeviceActivity(deviceId: string, limit: number = 100): Promise<DeviceActivity[]> {
    return Array.from(this.deviceActivities.values())
      .filter(activity => activity.deviceId === deviceId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async getUserDeviceActivity(userId: string, limit: number = 100): Promise<DeviceActivity[]> {
    return Array.from(this.deviceActivities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Statistics
  async getStats() {
    const deviceList = Array.from(this.devices.values());
    const requestList = Array.from(this.requests.values());
    const userList = Array.from(this.users.values());

    return {
      totalDevices: deviceList.length,
      availableDevices: deviceList.filter(d => d.status === "available").length,
      assignedDevices: deviceList.filter(d => d.status === "assigned").length,
      maintenanceDevices: deviceList.filter(d => d.status === "maintenance").length,
      pendingRequests: requestList.filter(r => r.status === "pending").length,
      activeUsers: userList.filter(u => u.role === "employee").length,
    };
  }
}

export const storage = new MemStorage();
