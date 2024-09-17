// testManager.js
// Description: Module for managing test execution

// Shared state modules
import { applicationConfig } from "./configManager.js";

// Global variables
("use strict");

let t_architectApi = null;

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

  const testData = applicationConfig.testingData;

  // Define mock data promises
  const flowsDatatableRowsPromise = fetchData(testData.datatableUrl);

  // Assign mock data promises to mock API functions
  t_architectApi = {
    getFlowsDatatableRows: function () {
      return flowsDatatableRowsPromise;
    },
  };
}

export { t_architectApi };
