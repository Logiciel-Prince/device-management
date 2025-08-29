import mongoose from "mongoose";

// Configure Mongoose globally to prevent buffering timeouts
mongoose.set("bufferCommands", false);

export const connectMongoDB = async () => {
    try {
        const mongoUri =
            process.env.MONGODB_URI ||
            "mongodb://localhost:27017/devicemanagement";

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain a minimum of 5 socket connections
            maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
        });

        console.log("Connected to MongoDB");

        // Set up connection event listeners
        mongoose.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected");
        });

        return mongoose.connection;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
};
