// sta.js
// Description: Utility module to handle speech & text analytics api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { sta } from "../app.js";
import { t_conversationsApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

// Get conversation sta data
export async function getStaData(conversationId) {
  console.log("[TIL] Getting STA data");
  let staData;

  if (testMode) {
    // Get sta data using test API
    let t_response = await t_conversationsApi.getAnalyticsStaData();
    let allStaData = t_response.staData;

    // Filter the sta data to match the provided conversationId
    staData = allStaData.filter(
      (staData) => staData.conversationId === conversationId
    );

    return staData;
  }

  try {
    let response = await conversationsApi.getAnalyticsStaData(conversationId);
    staData = response.staData;
    console.log("[TIL] Sta data returned", staData);
  } catch (error) {
    console.error("[TIL] Error getting sta data. ", error);
    throw error;
  }

  return staData;
}
