import crypto from "crypto";
import { UserModel } from "../models";
import { storage } from "../storage";

// Simple password hashing using Node.js crypto (for production, use bcrypt)
export class AuthService {
    private static hashPassword(password: string, salt: string): string {
        return crypto
            .pbkdf2Sync(password, salt, 10000, 64, "sha512")
            .toString("hex");
    }

    private static generateSalt(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    static async createUser(userData: {
        id?: string;
        email: string;
        firstName: string;
        lastName: string;
        password: string;
        role?: "admin" | "employee";
    }) {
        const salt = this.generateSalt();
        const passwordHash = `${salt}:${this.hashPassword(
            userData.password,
            salt
        )}`;

        const userId =
            userData.id ||
            `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        try {
            // Create user in storage with password hash in single operation
            const storageUser = await storage.upsertUser({
                id: userId,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: userData.role || "employee",
                passwordHash,
            } as any);

            return storageUser;
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user account");
        }
    }

    static async verifyPassword(
        email: string,
        password: string
    ): Promise<any | null> {
        const user = await UserModel.findOne({ email, isActive: true });
        if (!user) return null;

        const [salt, hash] = user.passwordHash.split(":");
        const computedHash = this.hashPassword(password, salt);

        if (hash === computedHash) {
            // Update last login
            await UserModel.findByIdAndUpdate(user._id, {
                lastLogin: new Date(),
            });

            return {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            };
        }

        return null;
    }

    static async changePassword(
        userId: string,
        oldPassword: string,
        newPassword: string
    ): Promise<boolean> {
        const user = await UserModel.findById(userId);
        if (!user) return false;

        const [salt, hash] = user.passwordHash.split(":");
        const computedHash = this.hashPassword(oldPassword, salt);

        if (hash !== computedHash) return false;

        const newSalt = this.generateSalt();
        const newPasswordHash = `${newSalt}:${this.hashPassword(
            newPassword,
            newSalt
        )}`;

        await UserModel.findByIdAndUpdate(userId, {
            passwordHash: newPasswordHash,
        });
        return true;
    }

    static async resetPassword(
        email: string,
        newPassword: string
    ): Promise<boolean> {
        const user = await UserModel.findOne({ email });
        if (!user) return false;

        const salt = this.generateSalt();
        const passwordHash = `${salt}:${this.hashPassword(newPassword, salt)}`;

        await UserModel.findByIdAndUpdate(user._id, { passwordHash });
        return true;
    }

    static async deactivateUser(userId: string): Promise<boolean> {
        const result = await UserModel.findByIdAndUpdate(userId, {
            isActive: false,
        });
        return !!result;
    }
}
