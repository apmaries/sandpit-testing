// eventUtils.js
// Description: Utility for handling events

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules

// Utility modules
import {
  modifyLibraryHandler,
  refreshLibraries,
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
window.modifyLibraryHandler = modifyLibraryHandler;
window.refreshLibraries = refreshLibraries;
window.generateDatatableSchema = downloadDatatableSchema;
window.validateDatatable = validateDatatable;
window.migrateDatatable = migrateDatatable;
window.openDatatableConfig = openDatatableConfig;
window.openDatatableRows = openDatatableRows;

// Exported selectedTags array
export const selectedTags = [];

("use strict");

// Function for button click event
function buttonClickHandler(button) {
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
}

// Enable event listeners for management tools buttons
export async function enableManagementToolsEventListeners() {
  // Management tools buttons
  const managementToolsButtons = document.querySelectorAll(
    'gux-button[name="management-tools-button"]'
  );
  managementToolsButtons.forEach((button) => {
    buttonClickHandler(button);
  });

  // Tags handling
  const tagsInput = document.getElementById("autocomplete-tags-input");
  const libraryRadios = document.querySelectorAll('input[name="action-radio"]');

  // Disable tags if bad library is selected
  libraryRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      const value = event.target.value;
      const tagsInput = document.getElementById("autocomplete-tags-input");
      if (value === "delete") {
        tagsInput.setAttribute("disabled", true);
      } else {
        tagsInput.removeAttribute("disabled");
      }
    });
  });

  // Initialize tags input
  initializeTagsInput();
}

// Function to get existing tags
function getExistingTags() {
  return applicationConfig.tags;
}

// Function to initialize tags input
function initializeTagsInput() {
  const tagsInput = document.getElementById("autocomplete-tags-input");
  const dataList = document.getElementById("suggestions");

  // Function to update datalist options
  function updateDatalistOptions(filteredValues) {
    // Clear existing options
    dataList.innerHTML = "";
    // Add new options
    filteredValues.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      dataList.appendChild(option);
    });
  }

  // Event listener for input field
  tagsInput.addEventListener("input", function () {
    const inputValue = tagsInput.value.toLowerCase();
    const existingTags = getExistingTags();
    const filteredValues = existingTags.filter(
      (value) =>
        value.toLowerCase().includes(inputValue) &&
        !selectedTags.includes(value)
    );
    updateDatalistOptions(filteredValues);
  });

  // Event listener for Enter and Tab keys to add tag
  tagsInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === "Tab") {
      addTag(tagsInput.value.trim());
      event.preventDefault();
    }
  });

  // Initialize datalist with all predefined values
  updateDatalistOptions(getExistingTags());
}

// Function to add a tag
function addTag(tag) {
  if (!selectedTags.includes(tag) && tag.trim() !== "") {
    selectedTags.push(tag);
    const tagsList = document.querySelector(".tags-list");
    const tagElement = document.createElement("div");
    tagElement.className = "tag";
    tagElement.innerHTML = `<span>${tag}</span><button>&times;</button>`;
    tagsList.appendChild(tagElement);

    // Add event listener to the remove button
    const removeButton = tagElement.querySelector("button");
    removeButton.addEventListener("click", () => removeTag(tag, tagElement));

    const tagsInput = document.getElementById("autocomplete-tags-input");
    tagsInput.value = "";
    updateDatalistOptions(
      getExistingTags().filter((value) => !selectedTags.includes(value))
    );
  }
}

// Function to remove a tag
function removeTag(tag, tagElement) {
  const index = selectedTags.indexOf(tag);
  if (index > -1) {
    selectedTags.splice(index, 1);
    const tagsList = document.querySelector(".tags-list");
    tagsList.removeChild(tagElement);

    // Remove event listener from the button
    const removeButton = tagElement.querySelector("button");
    removeButton.removeEventListener("click", () => removeTag(tag, tagElement));

    updateDatalistOptions(
      getExistingTags().filter((value) => !selectedTags.includes(value))
    );
  }
}

// Function to update datalist options
function updateDatalistOptions(filteredValues) {
  const dataList = document.getElementById("suggestions");
  // Clear existing options
  dataList.innerHTML = "";
  // Add new options
  filteredValues.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    dataList.appendChild(option);
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

      if (checked) {
        showTableColumn(tableId, value);
      } else {
        hideTableColumn(tableId, value);
      }
    });
  });
}
