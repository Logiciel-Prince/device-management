import { WebClient } from "@slack/web-api";

// Validate required environment variables
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN environment variable must be set");
}

if (!process.env.SLACK_CHANNEL_ID) {
  throw new Error("SLACK_CHANNEL_ID environment variable must be set");
}

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Sends a structured message to a Slack channel using the Slack Web API
 * Prefer using Channel ID to Channel names because they don't change when the
 * channel is renamed.
 * @param message - Structured message to send
 * @returns Promise resolving to the sent message's timestamp
 */
export async function sendSlackMessage(
  message: Parameters<typeof slack.chat.postMessage>[0]
): Promise<string | undefined> {
  try {
    // Send the message
    const response = await slack.chat.postMessage(message);

    // Return the timestamp of the sent message
    return response.ts;
  } catch (error) {
    console.error('Error sending Slack message:', error);
    throw error;
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
