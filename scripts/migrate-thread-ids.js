#!/usr/bin/env node

/**
 * Migration script to add slackThreadId column and migrate existing data
 * This script adds the new thread ID system while maintaining backward compatibility
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

async function migrateThreadIds() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    const client = postgres(connectionString);
    const db = drizzle(client);

    try {
        console.log('Starting thread ID migration...');

        // Add the new slackThreadId column
        console.log('Adding slackThreadId column...');
        await db.execute(sql`
            ALTER TABLE requests 
            ADD COLUMN IF NOT EXISTS slack_thread_id VARCHAR
        `);

        // Generate thread IDs for existing requests that have Slack message timestamps
        console.log('Generating thread IDs for existing requests...');
        await db.execute(sql`
            UPDATE requests 
            SET slack_thread_id = CONCAT('thread_', id)
            WHERE slack_message_ts IS NOT NULL 
            AND slack_thread_id IS NULL
        `);

        console.log('Migration completed successfully!');
        
        // Show migration results
        const result = await db.execute(sql`
            SELECT 
                COUNT(*) as total_requests,
                COUNT(slack_message_ts) as requests_with_slack_ts,
                COUNT(slack_thread_id) as requests_with_thread_id
            FROM requests
        `);
        
        console.log('Migration results:', result.rows[0]);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateThreadIds();
}

export { migrateThreadIds };