// sta.js
// Description: Utility module to handle speech & text analytics api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { staApi } from "../app.js";
import { t_staApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

// Get conversation sta data
async function getStaData(conversationId) {
  console.log("[TIL] Getting STA data");

  if (testMode) {
    // Get sta data using test API
    let t_response = await t_staApi.getSpeechandtextanalyticsConversation();
    // Not using conversation id in test mode - using a dummy conversation id to best replicate actual API call

    return t_response;
  }

  try {
    let response = await staApi.getSpeechandtextanalyticsConversation(
      conversationId
    );
    console.debug("[TIL] STA data returned", response);
  } catch (error) {
    throw error;
  }

  return response;
}

export async function processStaData(conversationId) {
  // Get STA data
  let staData = await getStaData(conversationId);

  // Process sentiment score / sentiment trend
  let sentimentScore = staData.sentimentScore;
  let sentimentTrendClass = staData.sentimentTrendClass;

  // Process empathy scores
  let empathyScores = staData.empathyScores.map((scoreObj) => scoreObj.score);

  // Get min & max empathy scores
  let minEmpathyScore = Math.min(...empathyScores);
  let maxEmpathyScore = Math.max(...empathyScores);

  return {
    sentimentScore,
    sentimentTrendClass,
    minEmpathyScore,
    maxEmpathyScore,
  };
}
