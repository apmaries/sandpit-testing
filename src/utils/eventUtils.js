// eventUtils.js
// Description: Utility for handling events

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { processConversationData } from "../modules/conversations.js";
import { processStaData } from "../modules/sta.js";
import { processRecordingData } from "../modules/recordings.js";

// Utility modules
import {
  downloadDatatableSchema,
  migrateDatatable,
  openDatatableConfig,
  openDatatableRows,
} from "./managementUtils.js";
import {
  populateDomTable,
  hideTableColumn,
  showTableColumn,
} from "../utils/domUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
window.generateDatatableSchema = downloadDatatableSchema;
window.migrateDatatable = migrateDatatable;
window.openDatatableConfig = openDatatableConfig;
window.openDatatableRows = openDatatableRows;

("use strict");

// Enable event listeners for add to library buttons
export async function enableActionButtonEventListeners() {
  // Select all buttons with the name 'add-to-library'
  const addButtons = document.querySelectorAll(
    'gux-button[name="add-to-library"]'
  );

  // Iterate over the NodeList and add event listeners
  addButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      let library;
      let inputValue;

      if (button.id === "add-to-good-btn") {
        library = "good";
        inputValue = document.querySelector(
          '#add-to-good-div input[slot="input"]'
        ).value;
      } else if (button.id === "add-to-bad-btn") {
        library = "bad";
        inputValue = document.querySelector(
          '#add-to-bad-div input[slot="input"]'
        ).value;
      }

      // Validate the input value for GUID syntax
      const guidPattern =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!guidPattern.test(inputValue)) {
        alert("Please enter a valid GUID.");
        return;
      }

      handleAddToLibraryClick(library, inputValue);
    });
  });
}

// Enable event listeners for management tools buttons
export async function enableManagementToolsEventListeners() {
  // Select all buttons with the name 'management-tools'
  const managementToolsButtons = document.querySelectorAll(
    'gux-button[name="management-tools-button"]'
  );

  // Iterate over the NodeList and add event listeners
  managementToolsButtons.forEach((button) => {
    button.addEventListener("click", async (event) => {
      const functionName = button.getAttribute("function-to-run");

      if (functionName && typeof window[functionName] === "function") {
        try {
          await window[functionName]();
        } catch (error) {
          console.error(`Error running function ${functionName}:`, error);
        }
      } else {
        console.error(
          `Function ${functionName} is not defined or not a function`
        );
      }
    });
  });
}

// Enable event listeners for DOM table checkboxes
export async function enableDomTableCheckboxEventListeners() {
  // Select all checkboxes with the name 'column-group-checkbox'
  const checkboxes = document.querySelectorAll(
    'input[name="column-group-checkbox"]'
  );

  // Iterate over the NodeList and add event listeners
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const checked = event.target.checked;
      const value = event.target.value;
      const tableId = event.target.getAttribute("data-table-id");

      console.log(
        `[TIL] Checkbox on ${tableId} with value ${value} is: ${checked}`
      );

      if (checked) {
        showTableColumn(tableId, value);
      } else {
        hideTableColumn(tableId, value);
      }
    });
  });
}

// Function to handle add to library button click event
async function handleAddToLibraryClick(library, inputValue) {
  console.log(`[TIL] Adding ${inputValue} to ${library} library`);
  // Add to library logic here

  // Check if conversation is already in library

  // Get conversation details
  let conversationDetails = await processConversationData(inputValue);

  // Get STA data
  let staDetails = await processStaData(inputValue);

  // Get recording data
  let recordingDetails = await processRecordingData(inputValue);

  // Map conversation details to a new object
  let conversationObj = {
    conversationDetail: conversationDetails[0].conversation, // Assuming only one conversation is returned as only a single id can be supplied in input value
    staDetail: staDetails,
    recordingDetail: recordingDetails,
  };

  console.log("[TIL] Conversation object", conversationObj);
}
