import { WebClient } from "@slack/web-api";

// Initialize Slack client only if credentials are available
const slack = process.env.SLACK_BOT_TOKEN ? new WebClient(process.env.SLACK_BOT_TOKEN) : null;

/**
 * Sends a structured message to a Slack channel using the Slack Web API
 * Prefer using Channel ID to Channel names because they don't change when the
 * channel is renamed.
 * @param message - Structured message to send
 * @returns Promise resolving to the sent message's timestamp
 */
export async function sendSlackMessage(
  message: Parameters<WebClient['chat']['postMessage']>[0]
): Promise<string | undefined> {
  // Check if Slack is configured
  if (!slack || !process.env.SLACK_BOT_TOKEN || !process.env.SLACK_CHANNEL_ID) {
    console.warn('Slack integration not configured. Skipping message send.');
    return undefined;
  }

  try {
    // Send the message
    const response = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID!,
      text: "DeviceFlow notification", // Default text
      ...message, // Override with provided message
    });

    // Return the timestamp of the sent message
    return response.ts;
  } catch (error: any) {
    // Handle specific Slack errors gracefully
    if (error.code === 'slack_webapi_platform_error') {
      if (error.data?.error === 'missing_scope') {
        console.warn('Slack integration needs additional permissions. Please update bot scopes to include chat:write:bot');
        return undefined; // Don't throw, just log and continue
      }
    }
    console.error('Error sending Slack message:', error);
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
  messageLimit: number = 100,
): Promise<any> {
  // Check if Slack is configured
  if (!slack || !process.env.SLACK_BOT_TOKEN) {
    console.warn('Slack integration not configured. Cannot read message history.');
    return { messages: [] };
  }

  try {
    // Get messages
    return await slack.conversations.history({
      channel: channel_id,
      limit: messageLimit,
    });
  } catch (error) {
    console.error('Error reading Slack message history:', error);
    throw error;
  }
}
