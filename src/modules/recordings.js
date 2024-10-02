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

    return response;
  } catch (error) {
    if (error.status === 404) {
      return null;
    } else {
      throw error;
    }
  }
}

export async function processRecordingData(conversationId) {
  try {
    // Get recording data
    let recordingData = await getRecordingData(conversationId);

    // Initialize variables to hold the minimum dates and combined file state
    let minArchiveDate = null;
    let minDeleteDate = null;
    let fileStates = new Set();

    if (!recordingData) {
      console.warn(
        "[TIL] No recording data found for conversation ID:",
        conversationId
      );
      return {
        file_state: "-",
        archive_date: "-",
        delete_date: "-",
      };
    }

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
  } catch (error) {
    console.error("[TIL] Error processing recording data", error);
    return {
      file_state: "-",
      archive_date: "-",
      delete_date: "-",
    };
  }
}
