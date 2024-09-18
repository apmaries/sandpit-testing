// eventUtils.js
// Description: Utility for handling events

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { processConversationData } from "../modules/conversations.js";
import { processStaData } from "../modules/sta.js";

// Utility modules
import { populateTable } from "../utils/domUtils.js";

// Global variables
//const testMode = applicationConfig.test.testMode;
("use strict");

// Function to handle add to library button click event
export async function handleAddToLibraryClick(library, inputValue) {
  console.log(`[TIL] Adding ${inputValue} to ${library} library`);
  // Add to library logic here

  // Check if conversation is already in library

  // Get conversation details
  let conversationDetails = await processConversationData(inputValue);

  // Get STA data
  let staDetails = await processStaData(inputValue);

  // Map conversation details to a new object
  let conversationObj = {
    conversationDetail: conversationDetails[0], // Assuming only one conversation is returned as only a single id can be supplied in input value
    staDetail: staDetails,
  };

  console.log("[TIL] Conversation object", conversationObj);
}
