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
    if (error.status === 404) {
      console.warn("[TIL] STA data not found");
      return null;
    } else {
      throw error;
    }
  }

  return response;
}

export async function processStaData(conversationId) {
  try {
    // Get STA data
    let staData = await getStaData(conversationId);

    if (!staData) {
      console.warn(
        "[TIL] No STA data found for conversation ID:",
        conversationId
      );
      return {
        sentiment_score: 0,
        sentiment_trend_class: "-",
        empathy_score: 0,
      };
    }

    // Process sentiment score / sentiment trend
    let sentiment_score = staData.sentimentScore ? staData.sentimentScore : 0;
    let sentiment_trend_class = staData.sentimentTrendClass
      ? staData.sentimentTrendClass.replace(/([A-Z])/g, " $1").trim()
      : "-";

    // Process empathy scores
    let empathyScores = staData.empathyScores.map((scoreObj) => scoreObj.score);

    // Get average empathy score
    let empathy_score =
      empathyScores.length === 0
        ? 0
        : empathyScores.reduce((a, b) => a + b, 0) / empathyScores.length;

    return {
      sentiment_score,
      sentiment_trend_class,
      empathy_score,
    };
  } catch (error) {
    console.error("[TIL] Error processing STA data", error);
    return {
      sentiment_score: 0,
      sentiment_trend_class: "-",
      empathy_score: 0,
    };
  }
}
