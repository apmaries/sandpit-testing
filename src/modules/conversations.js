// conversations.js
// Description: Utility module to handle conversations api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { conversationsApi } from "../app.js";
import { t_conversationsApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

// Get conversation data
async function getConversationsData(conversationIds) {
  console.log(`[TIL] Getting conversation data`);
  let conversations = [];

  let opts = {
    "id": conversationIds, // [String] | Comma-separated conversation ids
  };

  if (testMode) {
    // Get conversations using test API
    let t_response =
      await t_conversationsApi.getAnalyticsConversationsDetails();
    let allConversations = t_response.conversations;

    // Split the comma-separated conversationIds into an array
    let conversationIdsArray = conversationIds.split(",");

    // Filter the conversations to match the provided conversationIds
    conversations = allConversations.filter((conversation) =>
      conversationIdsArray.includes(conversation.conversationId)
    );

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

export async function processConversationData(conversationIds) {
  // Get interaction details from conversation api
  let conversationData = await getConversationsData(conversationIds);

  // Initialize an array to hold processed conversation data
  let processedConversations = [];

  // Iterate over each conversation in the conversationData array
  conversationData.forEach((conversation) => {
    let conversationParticipants = conversation.participants;

    // Get conversation ACD participant info
    let acdParticipants = conversationParticipants.filter(
      (participant) => participant.purpose === "acd"
    );

    // Get queue ids and names
    let queueIds = acdParticipants.map(
      (participant) => participant.participantId
    );
    let queueNames = acdParticipants.map(
      (participant) => participant.participantName
    );

    // Get media types
    let mediaTypes = [];
    for (let i = 0; i < acdParticipants.length; i++) {
      let participantSessions = acdParticipants[i].sessions;
      participantSessions.forEach((session) => {
        let mediaType = session.mediaType;
        if (!mediaTypes.includes(mediaType)) {
          mediaTypes.push(mediaType);
        }
      });
    }

    // Get conversation Agent participant data
    let agentParticipants = conversationParticipants.filter(
      (participant) => participant.purpose === "agent"
    );

    // Get total talk time for all agents
    let totalTalkTime = 0;
    agentParticipants.forEach((participant) => {
      let participantSessions = participant.sessions;
      participantSessions.forEach((session) => {
        let metrics = session.metrics;
        // return only if metric name is tHandle
        let talkTime = metrics.find((metric) => metric.name === "tTalk");
        if (talkTime) {
          totalTalkTime += talkTime.value;
        }
      });
    });

    // Get conversation evaluation data
    let averageEvalScore;
    let averageEvalCriticalScore;

    // Iterate through evaluations and average oTotalScore and oTotalCriticalScore values
    if (conversation.evaluations) {
      let totalScore = 0;
      let totalCriticalScore = 0;
      let evaluations = conversation.evaluations;
      let evaluationCount = evaluations.length;

      evaluations.forEach((evaluation) => {
        totalScore += evaluation.oTotalScore;
        totalCriticalScore += evaluation.oTotalCriticalScore;
      });

      averageEvalScore = totalScore / evaluationCount;
      averageEvalCriticalScore = totalCriticalScore / evaluationCount;
    }

    // Push the processed conversation data to the array
    processedConversations.push({
      conversation: {
        id: conversation.conversationId,
        divisionIds: conversation.divisionIds,
        conversationStart: conversation.conversationStart,
        conversationEnd: conversation.conversationEnd,
        queuesIds: queueIds,
        queuesNames: queueNames,
        mediaTypes: mediaTypes,
        totalTalkTime: totalTalkTime,
      },
      evaluation: {
        averageEvalScore: averageEvalScore,
        averageEvalCriticalScore: averageEvalCriticalScore,
      },
    });
  });

  return processedConversations;
}
