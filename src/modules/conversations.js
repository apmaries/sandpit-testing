// conversations.js
// Description: Utility module to handle conversations api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { conversationsApi } from "../app.js";
import { t_conversationsApi } from "../core/testManager.js";

// Api Modules
import { getDivisions } from "./objects.js";
import { processStaData } from "../modules/sta.js";
import { processRecordingData } from "../modules/recordings.js";

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
    console.debug("[TIL] Conversations returned", conversations);
  } catch (error) {
    throw error;
  }

  return conversations;
}

export async function processConversations(conversationIds) {
  // Get interaction details from conversation API
  let conversationData;
  try {
    conversationData = await getConversationsData(conversationIds);
    console.warn("[TIL] Conversation data returned", conversationData);
    if (!conversationData || conversationData.length === 0) {
      console.warn("[TIL] No conversation data found");
      return [];
    }
  } catch (error) {
    throw error;
  }

  // Initialize an array to hold processed conversation data
  let processedConversations = [];

  // Function to process conversation-level info
  async function processConversationInfo(conversation) {
    console.warn("[TIL] Processing conversation info", conversation);
    // Get conversation participants
    let conversationParticipants = conversation.participants;
    let conversationEvaluations = conversation.evaluations;
    let conversationSurveys = conversation.surveys;

    // Get conversation ACD participant info
    let acdParticipants = conversationParticipants.filter(
      (participant) => participant.purpose === "acd"
    );
    console.debug("[TIL] ACD participants", acdParticipants);

    // Get queue ids and names
    let conversationQueues = acdParticipants.map((participant) => ({
      id: participant.participantId,
      name: participant.participantName,
    }));

    // Extract IDs and names into separate arrays
    let queueIds = conversationQueues.map((queue) => queue.id).join(",");
    let queueNames = conversationQueues.map((queue) => queue.name).join(",");

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

    // Convert mediaTypes array to a comma-separated list
    let mediaTypesList = mediaTypes.join(",");

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
    if (conversationEvaluations) {
      let totalScore = 0;
      let totalCriticalScore = 0;
      let evaluationCount = conversationEvaluations.length;

      conversationEvaluations.forEach((evaluation) => {
        totalScore += evaluation.oTotalScore;
        totalCriticalScore += evaluation.oTotalCriticalScore;
      });

      averageEvalScore = totalScore / evaluationCount;
      averageEvalCriticalScore = totalCriticalScore / evaluationCount;
    }

    // Iterate through surveys and average oSurveyTotalScore and surveyPromoterScore values
    let surveyPromoterScore;
    let oSurveyTotalScore;
    if (conversationSurveys) {
      let totalPromoterScore = 0;
      let totalSurveyScore = 0;
      let promoterScoreCount = 0;
      let surveyScoreCount = 0;

      conversationSurveys.forEach((survey) => {
        console.log(survey);
        if (survey.surveyPromoterScore !== undefined) {
          totalPromoterScore += survey.surveyPromoterScore;
          promoterScoreCount++;
        }
        if (survey.oSurveyTotalScore !== undefined) {
          totalSurveyScore += survey.oSurveyTotalScore;
          surveyScoreCount++;
        }
      });

      surveyPromoterScore =
        promoterScoreCount > 0 ? totalPromoterScore / promoterScoreCount : 0;
      oSurveyTotalScore =
        surveyScoreCount > 0 ? totalSurveyScore / surveyScoreCount : 0;
    }

    return {
      details: {
        key: conversation.conversationId,
        start_date: conversation.conversationStart,
        end_date: conversation.conversationEnd,
        queue_ids: queueIds ? queueIds : "-",
        queue_names: queueNames ? queueNames : "-",
        media_type: mediaTypesList ? mediaTypesList : "-",
      },
      metrics: {
        total_talk_time: totalTalkTime ? totalTalkTime : 0,
      },
      evaluation: {
        evluation_total_score: averageEvalScore ? averageEvalScore : 0,
        evluation_total_critical_score: averageEvalCriticalScore
          ? averageEvalCriticalScore
          : 0,
      },
      survey: {
        survey_promoter_score: surveyPromoterScore ? surveyPromoterScore : 0,
        survey_total_score: oSurveyTotalScore ? oSurveyTotalScore : 0,
      },
    };
  }

  // Iterate over each conversation in the conversationData array
  for (const conversation of conversationData) {
    // Run the four subjects in parallel
    const [
      conversationInfo,
      conversationDivisions,
      staDetails,
      recordingDetails,
    ] = await Promise.all([
      processConversationInfo(conversation),
      getDivisions(conversation.divisionIds),
      processStaData(conversation.conversationId),
      processRecordingData(conversation.conversationId),
    ]);

    // Extract IDs and names into separate arrays
    let divisionIds = conversationDivisions
      .map((division) => division.id)
      .join(",");
    let divisionNames = conversationDivisions
      .map((division) => division.name)
      .join(",");

    // Push the processed conversation data to the array
    processedConversations.push({
      ...conversationInfo,
      details: {
        ...conversationInfo.details,
        division_ids: divisionIds,
        division_names: divisionNames,
      },
      sta: staDetails,
      recording: recordingDetails,
    });
  }

  return processedConversations;
}
