import { v4 as uuidv4 } from 'uuid';

/**
 * Thread management utilities for better parent message tracking
 */

export interface ThreadInfo {
    threadId: string;
    parentMessageTs?: string;
    isNewThread: boolean;
}

/**
 * Generates a unique thread ID for a new conversation thread
 * @param prefix - Optional prefix for the thread ID
 * @returns Unique thread ID
 */
export function generateThreadId(prefix: string = 'thread'): string {
    return `${prefix}_${uuidv4()}`;
}

/**
 * Creates thread information for a new request
 * @param requestId - The request ID to associate with the thread
 * @returns Thread information object
 */
export function createNewThread(requestId: string): ThreadInfo {
    return {
        threadId: generateThreadId('req'),
        isNewThread: true
    };
}

/**
 * Gets thread information for replying to an existing thread
 * @param threadId - Existing thread ID
 * @param parentMessageTs - Optional parent message timestamp for Slack compatibility
 * @returns Thread information object
 */
export function getExistingThread(threadId: string, parentMessageTs?: string): ThreadInfo {
    return {
        threadId,
        parentMessageTs,
        isNewThread: false
    };
}

/**
 * Validates if a thread ID is properly formatted
 * @param threadId - Thread ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidThreadId(threadId: string): boolean {
    if (!threadId || typeof threadId !== 'string') {
        return false;
    }
    
    // Check if it matches our expected format: prefix_uuid
    const threadIdPattern = /^[a-zA-Z]+_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    return threadIdPattern.test(threadId);
}

/**
 * Extracts the prefix from a thread ID
 * @param threadId - Thread ID to extract prefix from
 * @returns Prefix string or null if invalid
 */
export function getThreadPrefix(threadId: string): string | null {
    if (!isValidThreadId(threadId)) {
        return null;
    }
    
    const parts = threadId.split('_');
    return parts[0];
}

/**
 * Finds the most recent request for a device that has Slack threading info
 * @param requests - Array of requests to search through
 * @param deviceId - Device ID to find requests for
 * @returns Most recent request or null if none found
 */
export function findMostRecentRequestForDevice(requests: any[], deviceId: string): any | null {
    // Find all approved requests for this device that have Slack timestamps
    const matchingRequests = requests.filter(
        (request) =>
            request.assignedDeviceId === deviceId &&
            request.status === "approved" &&
            request.slackMessageTs
    );
    
    if (matchingRequests.length === 0) {
        return null;
    }
    
    // Sort by approval date (most recent first) or creation date if no approval date
    const sortedRequests = matchingRequests.sort((a, b) => {
        const dateA = a.approvedAt || a.createdAt;
        const dateB = b.approvedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    return sortedRequests[0];
}