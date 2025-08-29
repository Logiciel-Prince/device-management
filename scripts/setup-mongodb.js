#!/usr/bin/env node

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

async function setupMongoDB() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devicemanagement';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB successfully');

        const db = client.db();

        // Create collections with indexes
        const collections = [
            { name: 'users', indexes: [{ key: { email: 1 }, unique: true, sparse: true }] },
            { name: 'devices', indexes: [{ key: { serialNumber: 1 }, unique: true }] },
            { name: 'requests', indexes: [{ key: { userId: 1 } }, { key: { status: 1 } }] },
            { name: 'devicelogs', indexes: [{ key: { deviceId: 1 } }] },
            { name: 'deviceactivities', indexes: [{ key: { deviceId: 1 } }, { key: { userId: 1 } }] }
        ];

        for (const collection of collections) {
            // Create collection if it doesn't exist
            const collectionExists = await db.listCollections({ name: collection.name }).hasNext();
            if (!collectionExists) {
                await db.createCollection(collection.name);
                console.log(`✅ Created collection: ${collection.name}`);
            }

            // Create indexes
            for (const index of collection.indexes) {
                try {
                    await db.collection(collection.name).createIndex(index.key, {
                        unique: index.unique || false,
                        sparse: index.sparse || false
                    });
                    console.log(`✅ Created index on ${collection.name}:`, index.key);
                } catch (error) {
                    if (error.code !== 85) { // Index already exists
                        console.warn(`⚠️  Warning creating index on ${collection.name}:`, error.message);
                    }
                }
            }
        }

        console.log('🎉 MongoDB setup completed successfully!');

    } catch (error) {
        console.error('❌ MongoDB setup failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

setupMongoDB();