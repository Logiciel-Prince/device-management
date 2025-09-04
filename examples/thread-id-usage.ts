/**
 * Example usage of the new thread ID system for better parent message tracking
 * 
 * This replaces the fragile timestamp-based approach with proper thread IDs
 */

import { createNewThread, getExistingThread, isValidThreadId } from '../server/threadManager';
import { sendSlackMessage } from '../server/slack';

// Example 1: Creating a new thread for a device request
async function createDeviceRequestThread(requestId: string, userInfo: any) {
    // Generate a new thread ID for this request
    const threadInfo = createNewThread(requestId);
    
    console.log('Creating new thread:', threadInfo.threadId);
    
    // Send initial Slack message
    const messageTs = await sendSlackMessage({
        channel: process.env.SLACK_CHANNEL_ID!,
        text: `📱 New device request from ${userInfo.firstName} ${userInfo.lastName}`,
        blocks: [
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Device Request*\n*User:* ${userInfo.firstName} ${userInfo.lastName}\n*Type:* ${userInfo.deviceType}`
                }
            }
        ]
    });
    
    // Store both thread ID and message timestamp
    return {
        threadId: threadInfo.threadId,
        messageTs: messageTs,
        isNewThread: threadInfo.isNewThread
    };
}

// Example 2: Replying to an existing thread
async function replyToThread(threadId: string, messageTs: string, message: string) {
    // Validate thread ID
    if (!isValidThreadId(threadId)) {
        console.error('Invalid thread ID:', threadId);
        return;
    }
    
    // Get existing thread info
    const threadInfo = getExistingThread(threadId, messageTs);
    
    console.log('Replying to thread:', threadInfo.threadId);
    
    // Send reply in the thread
    await sendSlackMessage({
        channel: process.env.SLACK_CHANNEL_ID!,
        text: message,
        thread_ts: threadInfo.parentMessageTs // Use Slack timestamp for actual threading
    });
}

// Example 3: Approval workflow with thread tracking
async function approveRequestWithThread(requestId: string, request: any) {
    if (!request.slackThreadId) {
        console.warn('Request has no thread ID, cannot send threaded reply');
        return;
    }
    
    // Reply to the original thread
    await replyToThread(
        request.slackThreadId,
        request.slackMessageTs,
        `✅ Request approved! Device will be assigned shortly.`
    );
    
    console.log(`Approval sent to thread: ${request.slackThreadId}`);
}

// Example 4: Rejection workflow with thread tracking
async function rejectRequestWithThread(requestId: string, request: any, reason: string) {
    if (!request.slackThreadId) {
        console.warn('Request has no thread ID, cannot send threaded reply');
        return;
    }
    
    // Reply to the original thread
    await replyToThread(
        request.slackThreadId,
        request.slackMessageTs,
        `❌ Request rejected: ${reason}`
    );
    
    console.log(`Rejection sent to thread: ${request.slackThreadId}`);
}

// Example 5: Device return notification with thread tracking
async function notifyDeviceReturnWithThread(originalRequest: any, deviceInfo: any, userInfo: any) {
    if (!originalRequest.slackThreadId) {
        console.warn('Original request has no thread ID, sending new message instead of thread reply');
        
        // Fallback: send new message
        await sendSlackMessage({
            channel: process.env.SLACK_CHANNEL_ID!,
            text: `🔄 Device returned by ${userInfo.firstName} ${userInfo.lastName}\n📱 Device: ${deviceInfo.name} (${deviceInfo.type})`
        });
        return;
    }
    
    // Reply to the original request thread
    await replyToThread(
        originalRequest.slackThreadId,
        originalRequest.slackMessageTs,
        `🔄 Device returned by ${userInfo.firstName} ${userInfo.lastName}\n📱 Device: ${deviceInfo.name} (${deviceInfo.type})`
    );
    
    console.log(`Device return notification sent to thread: ${originalRequest.slackThreadId}`);
}

// Example 6: Migration helper - convert timestamp-based to thread ID-based
async function migrateRequestToThreadId(request: any, storage: any) {
    if (request.slackMessageTs && !request.slackThreadId) {
        // Generate thread ID for existing request
        const threadId = `req_${request.id}`;
        
        // Update the request with the new thread ID
        await storage.updateRequest(request.id, {
            slackThreadId: threadId
        });
        
        console.log(`Migrated request ${request.id} to use thread ID: ${threadId}`);
        return threadId;
    }
    
    return request.slackThreadId;
}

export {
    createDeviceRequestThread,
    replyToThread,
    approveRequestWithThread,
    rejectRequestWithThread,
    notifyDeviceReturnWithThread,
    migrateRequestToThreadId
};