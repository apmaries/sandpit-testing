// testManager.js
// Description: Module for managing test execution

// Shared state modules
import { applicationConfig } from "./configManager.js";

// Global variables
("use strict");

let t_architectApi = null;
let t_conversationsApi = null;
let t_integrationsApi = null;
let t_objectsApi = null;
let t_recordingApi = null;
let t_staApi = null;
let t_usersApi = null;

// Utility function to fetch test data
async function fetchData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(`[TIL] Error fetching data from ${url}`, error);
    throw error;
  }
}

// Prrimary function to initialize test mode
export async function initializeTestMode() {
  console.log("[TIL] Initializing test mode");

  const testData = {
    conversationsUrl: "../test/conversation_details.json",
    datatableSchemaUrl: "../test/datatable_schema.json",
    datatableRowsUrl: "../test/datatable_rows.json",
    divisionsUrl: "../test/divisions.json",
    integrationCurrentUrl: "../test/integration_current.json",
    recordingUrl: "../test/conversation_recording.json",
    staUrl: "../test/conversation_sta.json",
    userUrl: "../test/user.json",
  };

  // Define mock data promises
  const flowsDatatablePromise = fetchData(testData.datatableSchemaUrl);
  const flowsDatatableRowsPromise = fetchData(testData.datatableRowsUrl);
  const conversationsPromise = fetchData(testData.conversationsUrl);
  const divisionsPromise = fetchData(testData.divisionsUrl);
  const integrationCurrentPromise = fetchData(testData.integrationCurrentUrl);
  const recordingPromise = fetchData(testData.recordingUrl);
  const staPromise = fetchData(testData.staUrl);
  const usersPromise = fetchData(testData.userUrl);

  // Assign mock data promises to mock API functions
  t_architectApi = {
    getFlowsDatatable: function () {
      return flowsDatatablePromise;
    },
    getFlowsDatatableRows: function () {
      return flowsDatatableRowsPromise;
    },
  };
  t_conversationsApi = {
    getAnalyticsConversationsDetails: function () {
      return conversationsPromise;
    },
  };
  t_integrationsApi = {
    getIntegrationConfigCurrent: function () {
      return integrationCurrentPromise;
    },
  };
  t_objectsApi = {
    getAuthorizationDivisions: function () {
      return divisionsPromise;
    },
  };
  t_recordingApi = {
    getConversationRecordingmetadata: function () {
      return recordingPromise;
    },
  };
  t_staApi = {
    getSpeechandtextanalyticsConversation: function () {
      return staPromise;
    },
  };
  t_usersApi = {
    getUsersMe: function () {
      return usersPromise;
    },
  };
}

export {
  t_architectApi,
  t_conversationsApi,
  t_integrationsApi,
  t_objectsApi,
  t_recordingApi,
  t_staApi,
  t_usersApi,
};
