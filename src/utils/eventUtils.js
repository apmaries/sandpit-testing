// eventUtils.js
// Description: Utility for handling events

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules

// Utility modules
import {
  addToLibraryHandler,
  deleteFromLibraryHandler,
  downloadDatatableSchema,
  validateDatatable,
  migrateDatatable,
  openDatatableConfig,
  openDatatableRows,
} from "./managementUtils.js";
import {
  hideTableColumn,
  showTableColumn,
  updateManagementToolsResponse,
} from "../utils/domUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
window.generateDatatableSchema = downloadDatatableSchema;
window.validateDatatable = validateDatatable;
window.migrateDatatable = migrateDatatable;
window.openDatatableConfig = openDatatableConfig;
window.openDatatableRows = openDatatableRows;

("use strict");
// Enable event listeners for add and delete library buttons
export async function enableActionButtonEventListeners() {
  // Select all gux-list-item elements inside gux-action-button with the name 'modify-library'
  const actionItems = document.querySelectorAll(
    'gux-action-button[name="modify-library"] gux-list-item'
  );

  // Iterate over the NodeList and add event listeners
  actionItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      let library;
      let action;
      let inputValue;
      let responseEle;

      if (item.id.includes("good")) {
        library = "good";
        inputValue = document.querySelector(
          '#modify-good-library input[slot="input"]'
        ).value;
        responseEle = document.querySelector("#modify-good-library-response");
        responseEle.innerHTML = "";
      } else if (item.id.includes("bad")) {
        library = "bad";
        inputValue = document.querySelector(
          '#modify-bad-library input[slot="input"]'
        ).value;
        responseEle = document.querySelector("#modify-bad-library-response");
        responseEle.innerHTML = "";
      }

      // Simulate a click on the page title to close the list box
      const pageTitle = document.querySelector("h1"); // Adjust the selector as needed
      if (pageTitle) {
        pageTitle.click();
      }

      if (item.id.includes("add")) {
        action = "add";
      } else if (item.id.includes("del")) {
        action = "delete";
      }

      // Validate the input value for GUID syntax
      const guidPattern =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!guidPattern.test(inputValue)) {
        updateManagementToolsResponse(
          responseEle,
          "Invalid GUID format!",
          false
        );
        return;
      }

      if (action === "add") {
        addToLibraryHandler(library, inputValue);
      } else if (action === "delete") {
        deleteFromLibraryHandler(library, inputValue);
      }
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
