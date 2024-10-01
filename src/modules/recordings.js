// recording.js
// Description: Utility module to handle recordings api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { recordingApi } from "../app.js";
import { t_recordingApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

// Get recording data
async function getRecordingData(conversationId) {
  console.log("[TIL] Getting recording data");

  if (testMode) {
    // Get recording data using test API
    let t_response = await t_recordingApi.getConversationRecordingmetadata();
    // Not using recordingId in test mode - using a dummy recordingId to best replicate actual API call

    return t_response;
  }

  try {
    let response = await recordingApi.getConversationRecordingmetadata(
      conversationId
    );
    console.debug("[TIL] Recording data returned", response);
  } catch (error) {
    throw error;
  }

  return response;
}

export async function processRecordingData(conversationId) {
  // Get recording data
  let recordingData = await getRecordingData(conversationId);

  // Initialize variables to hold the minimum dates and combined file state
  let minArchiveDate = null;
  let minDeleteDate = null;
  let fileStates = new Set();

  // Process each recording in the array
  recordingData.forEach((recording) => {
    // Add the file state to the set
    fileStates.add(recording.fileState);

    // Update the minimum archive date
    if (recording.archiveDate) {
      if (
        !minArchiveDate ||
        new Date(recording.archiveDate) < new Date(minArchiveDate)
      ) {
        minArchiveDate = recording.archiveDate;
      }
    }

    // Update the minimum delete date
    if (recording.deleteDate) {
      if (
        !minDeleteDate ||
        new Date(recording.deleteDate) < new Date(minDeleteDate)
      ) {
        minDeleteDate = recording.deleteDate;
      }
    }
  });

  // Combine file states into a single string
  let file_state =
    fileStates.size > 0 ? Array.from(fileStates).join(", ") : "-";

  return {
    file_state,
    archive_date: minArchiveDate ? minArchiveDate : "-",
    delete_date: minDeleteDate ? minDeleteDate : "-",
  };
}
