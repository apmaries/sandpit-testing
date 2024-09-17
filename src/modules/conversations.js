// conversations.js
// Description: Utility module to handle conversations api

// Shared state modules
import { applicationConfig } from "./core/configManager.js";

// Api instances
import { conversationsApi } from "./app.js";
import { t_conversationsApi } from "./core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.testMode;

// Get conversation data
export async function getConversations(conversationIds) {
  console.log("[TIL] Getting conversations");
  let conversations = [];

  let opts = {
    "id": conversationIds, // [String] | Comma-separated conversation ids
  };

  if (testMode) {
    // Get conversations using test API
    let t_response =
      await t_conversationsApi.getAnalyticsConversationsDetails();
    conversations = t_response.conversations;
    return conversations;
  }

  try {
    let response = await conversationsApi.getAnalyticsConversationsDetails(
      opts
    );
    conversations = response.conversations;
    console.log("[TIL] Conversations returned", conversations);
  } catch (error) {
    console.error("[TIL] Error getting conversations. ", error);
    throw error;
  }

  return conversations;
}
