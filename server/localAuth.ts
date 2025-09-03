import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStore from "memorystore";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { AuthService } from "./services/authService";
import { validateBody } from "./middleware/validation";
import { z } from "zod";

// Validation schemas
const signupSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(["admin", "employee"]).optional(),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

    return session({
        secret: process.env.SESSION_SECRET || "local-dev-session-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: sessionTtl,
        },
    });
}

export async function setupAuth(app: Express) {
    app.set("trust proxy", 1);
    
    // Session middleware
    app.use(getSession());
    
    app.use(passport.initialize());
    app.use(passport.session());

    // Local strategy for username/password authentication
    passport.use(
        new LocalStrategy(
            {
                usernameField: "email",
                passwordField: "password",
            },
            async (email, password, done) => {
                try {
                    const user = await AuthService.verifyPassword(
                        email,
                        password
                    );

                    if (!user) {
                        return done(null, false, {
                            message: "Invalid email or password",
                        });
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            console.log("Deserializing user with ID:", id);
            const user = await storage.getUser(id);
            console.log("Deserialized user:", user?.email || "not found");
            done(null, user);
        } catch (error) {
            console.error("Deserialization error:", error);
            done(error);
        }
    });

    // Login endpoint
    app.post(
        "/api/login",
        validateBody(loginSchema),
        passport.authenticate("local"),
        (req: any, res) => {
            console.log("Login successful for user:", req.user?.email);
            console.log("Session ID:", req.sessionID);
            console.log("Session passport:", req.session.passport);
            
            res.json({
                message: "Login successful",
                user: req.user,
            });
        }
    );

    // Change password endpoint
    app.post(
        "/api/auth/change-password",
        isAuthenticated,
        async (req: any, res) => {
            try {
                const { oldPassword, newPassword } = req.body;

                if (!oldPassword || !newPassword) {
                    return res.status(400).json({
                        message: "Old password and new password are required",
                    });
                }

                if (newPassword.length < 6) {
                    return res.status(400).json({
                        message:
                            "New password must be at least 6 characters long",
                    });
                }

                const success = await AuthService.changePassword(
                    req.user.id,
                    oldPassword,
                    newPassword
                );

                if (!success) {
                    return res.status(400).json({
                        message: "Invalid old password",
                    });
                }

                res.json({ message: "Password changed successfully" });
            } catch (error) {
                console.error("Change password error:", error);
                res.status(500).json({ message: "Failed to change password" });
            }
        }
    );

    // Signup endpoint
    app.post("/api/signup", validateBody(signupSchema), async (req, res) => {
        try {
            const { firstName, lastName, email, password, role } = req.body;

            // Check if user already exists
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    message: "User with this email already exists",
                });
            }

            // Create user with hashed password
            const newUser = await AuthService.createUser({
                email,
                firstName,
                lastName,
                password,
                role: role || "employee",
            });

            res.status(201).json({
                message: "Account created successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                },
            });
        } catch (error) {
            console.error("Signup error:", error);
            res.status(500).json({
                message: "Failed to create account",
            });
        }
    });

    // Get current user
    app.get("/api/auth/user", isAuthenticated, (req, res) => {
        res.json(req.user);
    });

    // Session health check endpoint
    app.get("/api/auth/session", (req: any, res) => {
        res.json({
            sessionID: req.sessionID,
            authenticated: req.isAuthenticated(),
            user: req.user || null,
            sessionData: {
                cookie: req.session.cookie,
                passport: req.session.passport || null,
            },
        });
    });

    // Logout endpoint - support both GET and POST
    const logoutHandler = (req: any, res: any) => {
        req.logout((err: any) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ message: "Logout failed" });
            }

            // Clear session
            req.session.destroy((sessionErr: any) => {
                if (sessionErr) {
                    console.error("Session destruction error:", sessionErr);
                }

                // Clear session cookies with proper options
                const cookieOptions = {
                    path: "/",
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
                };

                res.clearCookie("devicemgmt.sid", cookieOptions);
                res.clearCookie("connect.sid", cookieOptions);

                // For GET requests (from frontend links), redirect to login
                if (req.method === "GET") {
                    return res.redirect("/login");
                }
                // For POST requests (from API calls), return JSON
                res.json({ message: "Logout successful" });
            });
        });
    };

    app.get("/api/logout", logoutHandler);
    app.post("/api/logout", logoutHandler);

    // Test endpoint to verify JSON responses work
    app.get("/api/test", (req, res) => {
        console.log("Test endpoint called");
        res.json({
            message: "Test endpoint working",
            timestamp: new Date().toISOString(),
        });
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};
