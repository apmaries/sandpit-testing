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
  console.log(`[TIL] Getting conversations`);
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
  console.log("[TIL] Starting processConversations");

  // Get interaction details from conversation API
  let conversationData;
  try {
    conversationData = await getConversationsData(conversationIds);
    console.debug("[TIL] Conversation data returned", conversationData);
    if (!conversationData || conversationData.length === 0) {
      console.warn("[TIL] No conversation data found");
      return [];
    }
  } catch (error) {
    console.error("[TIL] Error fetching conversation data", error);
    throw error;
  }

  console.log(`[TIL] Processing ${conversationData.length} conversations`);

  // Initialize an array to hold processed conversation data
  let processedConversations = [];

  // Function to process conversation-level info
  async function processConversationInfo(conversation, shortId) {
    console.log(`[TIL] ${shortId} - Getting conversation info`);
    // Get conversation participants
    let conversationParticipants = conversation.participants;
    let conversationEvaluations = conversation.evaluations;
    let conversationSurveys = conversation.surveys;

    // Get conversation ACD participant info
    let acdParticipants = conversationParticipants.filter(
      (participant) => participant.purpose === "acd"
    );

    // Get queue ids and names
    let conversationQueues = acdParticipants.map((participant) => ({
      id: participant.participantId,
      name: participant.participantName,
    }));

    // Extract IDs and names into separate arrays
    let queueIds = conversationQueues.map((queue) => queue.id).join("|||");
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
    let surveyPromoterScore = 0;
    let oSurveyTotalScore = 0;

    if (conversationSurveys && conversationSurveys.length > 0) {
      let totalSurveyScore = 0;
      let surveyScoreCount = 0;

      let promoterCount = 0;
      let detractorCount = 0;
      let totalResponses = conversationSurveys.length;

      conversationSurveys.forEach((survey) => {
        if (survey.surveyPromoterScore !== undefined) {
          if (survey.surveyPromoterScore >= 9) {
            promoterCount++;
          } else if (survey.surveyPromoterScore <= 6) {
            detractorCount++;
          }
        }
        if (survey.oSurveyTotalScore !== undefined) {
          totalSurveyScore += survey.oSurveyTotalScore;
          surveyScoreCount++;
        }
      });

      surveyPromoterScore =
        ((promoterCount - detractorCount) / (promoterCount + detractorCount)) *
        100;
      oSurveyTotalScore =
        surveyScoreCount > 0 ? totalSurveyScore / surveyScoreCount : 0;
    }

    let processedConversation = {
      conversation_id: conversation.conversationId,
      details: {
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
        evaluation_total_score: averageEvalScore,
        evaluation_total_critical_score: averageEvalCriticalScore,
      },
      survey: {
        survey_promoter_score: surveyPromoterScore,
        survey_total_score: oSurveyTotalScore,
      },
    };

    console.debug(
      `[TIL] ${shortId} - Processed conversation info`,
      processedConversation
    );
    return processedConversation;
  }

  // Process all conversations in parallel
  const processedConversationsPromises = conversationData.map(
    async (conversation, index) => {
      const shortId = `C${String(index + 1).padStart(2, "0")}`;
      console.log(
        `[TIL] Processing conversation ${shortId} (${conversation.conversationId})`
      );

      // Run the four subjects in parallel
      const [
        conversationInfo,
        conversationDivisions,
        staDetails,
        recordingDetails,
      ] = await Promise.all([
        processConversationInfo(conversation, shortId),
        (async () => {
          console.log(`[TIL] ${shortId} - Getting divisions`);
          return getDivisions(conversation.divisionIds);
        })(),
        (async () => {
          console.log(`[TIL] ${shortId} - Getting STA data`);
          return processStaData(conversation.conversationId);
        })(),
        (async () => {
          console.log(`[TIL] ${shortId} - Getting recording data`);
          return processRecordingData(conversation.conversationId);
        })(),
      ]);

      // Extract IDs and names into separate arrays
      let divisionIds = conversationDivisions
        .map((division) => division.id)
        .join(",");
      let divisionNames = conversationDivisions
        .map((division) => division.name)
        .join("|||");

      console.log(`[TIL] ${shortId} - Processing complete`);

      // Return the processed conversation data
      return {
        ...conversationInfo,
        details: {
          ...conversationInfo.details,
          division_ids: divisionIds,
          division_names: divisionNames,
        },
        sta: staDetails,
        recording: recordingDetails,
      };
    }
  );

  try {
    // Wait for all conversations to be processed
    processedConversations = await Promise.all(processedConversationsPromises);
    console.log("[TIL] All conversations processed");
  } catch (error) {
    console.error("[TIL] Error processing conversations", error);
    throw error;
  }
  return processedConversations;
}
