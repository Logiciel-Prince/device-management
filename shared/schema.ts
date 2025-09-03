import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("employee"), // "admin" or "employee"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device table
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // "smartphone", "tablet", "laptop"
  model: varchar("model").notNull(),
  serialNumber: varchar("serial_number").notNull().unique(),
  status: varchar("status").notNull().default("available"), // "available", "assigned", "maintenance"
  assignedTo: varchar("assigned_to").references(() => users.id),
  purchaseDate: timestamp("purchase_date"),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device requests table
export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceType: varchar("device_type").notNull(),
  deviceModel: varchar("device_model"),
  reason: text("reason"),
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "rejected"
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  assignedDeviceId: varchar("assigned_device_id").references(() => devices.id),
  slackMessageTs: varchar("slack_message_ts"), // Slack message timestamp for threading
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Device usage logs
export const deviceLogs = pgTable("device_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(), // "assigned", "returned", "maintenance"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Device activity tracking for parental controls
export const deviceActivity = pgTable("device_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  userId: varchar("user_id").references(() => users.id),
  activityType: varchar("activity_type").notNull(), // "app_usage", "website_visit", "call", "message", "location"
  appName: varchar("app_name"),
  website: varchar("website"),
  duration: varchar("duration"), // duration in minutes
  data: text("data"), // JSON data for additional details
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceSchema = createInsertSchema(devices)
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
        lastActivity: true,
    })
    .extend({
        serialNumber: z.string().min(1, "Serial number is required").trim(),
        name: z.string().min(1, "Device name is required").trim(),
        type: z.string().min(1, "Device type is required"),
        model: z.string().min(1, "Model is required").trim(),
    });

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  assignedDeviceId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceLogSchema = createInsertSchema(deviceLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDeviceActivitySchema = createInsertSchema(deviceActivity).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Request = typeof requests.$inferSelect & {
  slackMessageTs?: string; // Slack message timestamp for threading
};
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type DeviceLog = typeof deviceLogs.$inferSelect;
export type InsertDeviceLog = z.infer<typeof insertDeviceLogSchema>;
export type DeviceActivity = typeof deviceActivity.$inferSelect;
export type InsertDeviceActivity = z.infer<typeof insertDeviceActivitySchema>;

// Extended types for API responses
export type RequestWithUser = Request & {
  user: User;
  assignedDevice?: Device;
  approver?: User;
};

export type DeviceWithUser = Device & {
  assignedUser?: User;
};
