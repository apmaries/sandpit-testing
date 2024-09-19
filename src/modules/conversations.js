// conversations.js
// Description: Utility module to handle conversations api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { conversationsApi } from "../app.js";
import { t_conversationsApi } from "../core/testManager.js";

// Api Modules
import { getDivisions } from "./objects.js";

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
  for (const conversation of conversationData) {
    // Get conversation divisions
    let conversationDivisions = await getDivisions(conversation.divisionIds);

    // Get conversation participants
    let conversationParticipants = conversation.participants;

    // Get conversation ACD participant info
    let acdParticipants = conversationParticipants.filter(
      (participant) => participant.purpose === "acd"
    );

    // Get queue ids and names
    let conversationQueues = acdParticipants.map((participant) => ({
      id: participant.participantId,
      name: participant.participantName,
    }));

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

    // Get conversation agent participant data
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

    // Get conversation survey data
    let surveyPromoterScore;
    let oSurveyTotalScore;

    if (conversation.surveys && conversation.surveys.length > 0) {
      // Assuming we are interested in the first survey if multiple surveys exist
      let survey = conversation.surveys[0];

      if (survey.surveyPromoterScore !== undefined) {
        surveyPromoterScore = survey.surveyPromoterScore;
      }

      if (survey.oSurveyTotalScore !== undefined) {
        oSurveyTotalScore = survey.oSurveyTotalScore;
      }
    }

    // Push the processed conversation data to the array
    processedConversations.push({
      conversation: {
        details: {
          id: conversation.conversationId,
          conversationStart: conversation.conversationStart,
          conversationEnd: conversation.conversationEnd,
          divisions: conversationDivisions,
          queues: conversationQueues,
          mediaTypes: mediaTypes,
        },
        metrics: {
          totalTalkTime: totalTalkTime,
        },
        evaluation: {
          averageEvalScore: averageEvalScore,
          averageEvalCriticalScore: averageEvalCriticalScore,
        },
        survey: {
          surveyPromoterScore: surveyPromoterScore,
          surveyTotalScore: oSurveyTotalScore,
        },
      },
    });
  }

  return processedConversations;
}
