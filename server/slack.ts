import { WebClient } from "@slack/web-api";

// Lazy initialization of Slack client
let slack: WebClient | null = null;

function getSlackClient(): WebClient | null {
    if (!process.env.SLACK_BOT_TOKEN) {
        return null;
    }

    if (!slack) {
        slack = new WebClient(process.env.SLACK_BOT_TOKEN);
    }

    return slack;
}

/**
 * Sends a structured message to a Slack channel using the Slack Web API
 * Prefer using Channel ID to Channel names because they don't change when the
 * channel is renamed.
 * @param message - Structured message to send
 * @returns Promise resolving to the sent message's timestamp
 */
export async function sendSlackMessage(
    message: Parameters<WebClient["chat"]["postMessage"]>[0]
): Promise<string | undefined> {
    const slackClient = getSlackClient();

    // Check if Slack is configured
    if (
        !slackClient ||
        !process.env.SLACK_BOT_TOKEN ||
        !process.env.SLACK_CHANNEL_ID
    ) {
        console.warn(
            "Slack integration not configured. Skipping message send."
        );
        return undefined;
    }

    try {
        // Send the message
        const response = await slackClient.chat.postMessage({
            channel: process.env.SLACK_CHANNEL_ID!,
            text: "DeviceFlow notification", // Default text
            ...message, // Override with provided message
        });

        // Return the timestamp of the sent message
        return response.ts;
    } catch (error: any) {
        // Handle specific Slack errors gracefully
        if (error.code === "slack_webapi_platform_error") {
            if (error.data?.error === "missing_scope") {
                console.warn(
                    "Slack integration needs additional permissions. Please update bot scopes to include: chat:write, chat:write.public, channels:read"
                );
                return undefined; // Don't throw, just log and continue
            } else if (error.data?.error === "channel_not_found") {
                console.warn(
                    `Slack channel not found: ${process.env.SLACK_CHANNEL_ID}. Make sure the bot is added to the channel or use a different channel ID.`
                );
                return undefined;
            }
        }
        console.error("Error sending Slack message:", error);
        return undefined; // Don't throw, just log and continue
    }
}

/**
 * Reads the history of a channel
 * @param channel_id - Channel ID to read message history from
 * @param messageLimit - Maximum number of messages to retrieve
 * @returns Promise resolving to the messages
 */
export async function readSlackHistory(
    channel_id: string,
    messageLimit: number = 100
): Promise<any> {
    const slackClient = getSlackClient();

    // Check if Slack is configured
    if (!slackClient || !process.env.SLACK_BOT_TOKEN) {
        console.warn(
            "Slack integration not configured. Cannot read message history."
        );
        return { messages: [] };
    }

    try {
        // Get messages
        return await slackClient.conversations.history({
            channel: channel_id,
            limit: messageLimit,
        });
    } catch (error) {
        console.error("Error reading Slack message history:", error);
        throw error;
    }
}
