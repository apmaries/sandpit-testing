// eventUtils.js
// Description: Utility for handling events

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { getConversations } from "../modules/conversations.js";

// Utility modules
import { populateTable } from "../utils/domUtils.js";

// Global variables
//const testMode = applicationConfig.test.testMode;
("use strict");

// Function to handle add to library button click event
export async function handleAddToLibraryClick(library, inputValue) {
  console.log(`[TIL] Adding ${inputValue} to ${library} library`);
  // Add to library logic here
  let totalScore;
  let totalCriticalScore;

  // Check if conversation is already in library

  // Get interaction details from conversation api
  let conversationResponse = await getConversations(inputValue);
  let conversation = conversationResponse[0];
  console.log("[TIL] Conversation details", conversation);

  // Get conversation participants
  let conversationParticipants = conversation.participants;

  // iterate through participants and get participant id and name if purpose is 'acd'
  let acdParticipants = conversationParticipants.filter(
    (participant) => participant.purpose === "acd"
  );

  console.log("[TIL] ACD participants", acdParticipants);
  let queueIds = acdParticipants.map(
    (participant) => participant.participantId
  );
  let queueNames = acdParticipants.map(
    (participant) => participant.participantName
  );

  let mediaTypes = [];
  for (let i = 0; i < acdParticipants.length; i++) {
    let participantSessions = acdParticipants[i].sessions;
    console.log(`[TIL] Participant ${i} sessions`, participantSessions);
    participantSessions.forEach((session) => {
      let mediaType = session.mediaType;
      if (!mediaTypes.includes(mediaType)) {
        mediaTypes.push(mediaType);
      }
    });
  }

  console.log("[TIL] Queue ids", queueIds);
  console.log("[TIL] Queue names", queueNames);
  console.log("[TIL] Media types", mediaTypes);

  // Check if conversation has evaluations
  if (conversation.evaluations) {
    // Iterate through evaluations and average oTotalScore and oTotalCriticalScore values
    totalScore = 0;
    totalCriticalScore = 0;
    let evaluations = conversation.evaluations;
    let evaluationCount = evaluations.length;

    evaluations.forEach((evaluation) => {
      totalScore += evaluation.oTotalScore;
      totalCriticalScore += evaluation.oTotalCriticalScore;
    });

    let averageScore = totalScore / evaluationCount;
    let averageCriticalScore = totalCriticalScore / evaluationCount;
    console.log("[TIL] Average score", averageScore);
    console.log("[TIL] Average critical score", averageCriticalScore);
  }

  // Map conversation details to a new object
  let conversationObj = {
    id: conversation.id,
    type: library,
    divisionIds: conversation.divisionIds,
    start: conversation.conversationStart,
    end: conversation.conversationEnd,
    queuesIds: queueIds,
    queuesNames: queueNames,
    mediaTypes: mediaTypes,
    totalScore: totalScore,
    totalCriticalScore: totalCriticalScore,
  };
}
