#!/usr/bin/env node

/**
 * MongoDB Migration script to add slackThreadId field and migrate existing data
 * This script adds the new thread ID system while maintaining backward compatibility
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// Request schema for migration
const requestSchema = new mongoose.Schema({
    _id: String,
    userId: String,
    deviceType: String,
    deviceModel: String,
    reason: String,
    status: String,
    approvedBy: String,
    approvedAt: Date,
    rejectionReason: String,
    assignedDeviceId: String,
    slackThreadId: String,
    slackMessageTs: String,
    createdAt: Date,
    updatedAt: Date,
}, { _id: false });

const RequestModel = mongoose.model('Request', requestSchema);

async function migrateThreadIds() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/devicemanagement";
    
    try {
        console.log('Connecting to MongoDB at:', mongoUri);
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('Connected to MongoDB');
        console.log('Starting thread ID migration...');
        
        // First, let's see what we have in the database
        const allRequests = await RequestModel.find({});
        console.log(`Total requests in database: ${allRequests.length}`);
        
        const requestsWithSlackTs = await RequestModel.find({
            slackMessageTs: { $exists: true, $ne: null }
        });
        console.log(`Requests with Slack timestamps: ${requestsWithSlackTs.length}`);
        
        if (requestsWithSlackTs.length > 0) {
            console.log('Sample request with Slack timestamp:', {
                id: requestsWithSlackTs[0]._id,
                slackMessageTs: requestsWithSlackTs[0].slackMessageTs,
                slackThreadId: requestsWithSlackTs[0].slackThreadId
            });
        }

        // Find all requests that have Slack message timestamps but no thread ID
        const requestsToMigrate = await RequestModel.find({
            slackMessageTs: { $exists: true, $ne: null },
            slackThreadId: { $exists: false }
        });

        console.log(`Found ${requestsToMigrate.length} requests to migrate`);

        if (requestsToMigrate.length === 0) {
            console.log('No requests need migration');
            return;
        }

        // Update each request with a thread ID
        let migratedCount = 0;
        for (const request of requestsToMigrate) {
            const threadId = `req_${request._id}`;
            
            await RequestModel.updateOne(
                { _id: request._id },
                { 
                    $set: { 
                        slackThreadId: threadId,
                        updatedAt: new Date()
                    }
                }
            );
            
            migratedCount++;
            console.log(`Migrated request ${request._id} -> thread ID: ${threadId}`);
        }

        console.log(`Migration completed! Migrated ${migratedCount} requests`);
        
        // Show migration results
        const totalRequests = await RequestModel.countDocuments();
        const finalRequestsWithSlackTs = await RequestModel.countDocuments({ 
            slackMessageTs: { $exists: true, $ne: null } 
        });
        const finalRequestsWithThreadId = await RequestModel.countDocuments({ 
            slackThreadId: { $exists: true, $ne: null } 
        });
        
        console.log('Migration results:');
        console.log(`- Total requests: ${totalRequests}`);
        console.log(`- Requests with Slack timestamp: ${finalRequestsWithSlackTs}`);
        console.log(`- Requests with thread ID: ${finalRequestsWithThreadId}`);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run migration if this file is executed directly
console.log('Script starting...');

// More robust check for main module
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());

if (isMainModule) {
    console.log('Running migration...');
    migrateThreadIds().catch(console.error);
} else {
    console.log('Not running as main module, forcing run anyway...');
    migrateThreadIds().catch(console.error);
}

export { migrateThreadIds };