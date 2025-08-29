import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import bcrypt from "bcrypt";

// Simple user credentials for demo (in production, use proper user management)
const DEMO_USERS: Array<{
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "admin" | "employee";
}> = [
    {
        id: "admin-1",
        email: "admin@company.com",
        password: "admin123", // In production, this should be hashed
        firstName: "Admin",
        lastName: "User",
        role: "admin" as const,
    },
    {
        id: "employee-1",
        email: "employee@company.com",
        password: "employee123", // In production, this should be hashed
        firstName: "Employee",
        lastName: "User",
        role: "employee" as const,
    },
];

export function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

    // Use memory store for local development (in production, use proper session store)
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
                    // Find user in demo users
                    const user = DEMO_USERS.find((u) => u.email === email);

                    if (!user) {
                        return done(null, false, {
                            message: "Invalid email or password",
                        });
                    }

                    // In production, use bcrypt.compare for hashed passwords
                    if (user.password !== password) {
                        return done(null, false, {
                            message: "Invalid email or password",
                        });
                    }

                    // Upsert user in database
                    await storage.upsertUser({
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                    });

                    return done(null, {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                    });
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
            const user = await storage.getUser(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });

    // Login endpoint
    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.json({
            message: "Login successful",
            user: req.user,
        });
    });

    // Signup endpoint
    app.post("/api/signup", async (req, res) => {
        try {
            const { firstName, lastName, email, password, role } = req.body;

            // Validate required fields
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    message: "All fields are required",
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    message: "Invalid email format",
                });
            }

            // Validate password length
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long",
                });
            }

            // Check if user already exists
            const existingUser = await storage.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    message: "User with this email already exists",
                });
            }

            // Generate unique ID
            const userId = `user-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`;

            // Hash password (in production, use bcrypt)
            // For demo purposes, we'll store plain text but in production use:
            // const hashedPassword = await bcrypt.hash(password, 10);

            // Create user in database
            const newUser = await storage.upsertUser({
                id: userId,
                email,
                firstName,
                lastName,
                role: role || "employee",
            });

            // Add to demo users array for login (temporary solution)
            DEMO_USERS.push({
                id: userId,
                email,
                password, // In production, store hashed password
                firstName,
                lastName,
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

                // Clear all cookies
                res.clearCookie("connect.sid", { path: "/" });
                res.clearCookie("connect.sid");

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

    // Demo users endpoint (for development)
    app.get("/api/demo-users", (req, res) => {
        res.json(
            DEMO_USERS.map((u) => ({
                email: u.email,
                password: u.password,
                role: u.role,
                name: `${u.firstName} ${u.lastName}`,
            }))
        );
    });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
};
