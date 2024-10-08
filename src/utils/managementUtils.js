// managementUtils.js
// Description: Utility for management operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import {
  createDatatableRow,
  deleteDatatableRow,
  getDatatableRow,
  getDatatableRows,
  updateDatatableRow,
} from "../modules/architect.js";
import { processConversations } from "../modules/conversations.js";

// Utility modules
import {
  generateDatatableSchema,
  validateDatatableSchema,
  makeDatatable,
} from "./datatableUtils.js";
import {
  populateTablesAndHandleAlerts,
  removeDomTableRow,
  updateManagementToolsResponse,
} from "./domUtils.js";
import { selectedTags } from "./eventUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Helper function to flatten the conversation schema
function flattenConversation(conversation) {
  const flattened = {
    key: conversation.conversation_id,
  };

  Object.keys(conversation).forEach((group) => {
    if (group !== "conversation_id") {
      Object.keys(conversation[group]).forEach((key) => {
        const column = conversation[group][key];
        flattened[`${key}`] = column;
      });
    }
  });

  return flattened;
}

// Helper function to download an object as a JSON file
async function downloadObjectAsJson(obj, name) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Helper function to check if a conversation is in the specified library
async function checkConversationInLibrary(inputValue, library) {
  try {
    const existingRow = await getDatatableRow(inputValue, false);

    if (existingRow && existingRow.key === inputValue) {
      if (existingRow.library_type === library) {
        return { exists: true, error: null };
      } else {
        return {
          exists: false,
          error: `Conversation ID '${inputValue}' already exists in ${existingRow.library_type} library!`,
        };
      }
    }
    return { exists: false, error: null };
  } catch (error) {
    return { exists: false, error: error.message || error };
  }
}

// Function to handle add to library button click event
async function addToLibraryHandler(library, inputValue, tags) {
  console.info(`[TIL] Adding ${inputValue} to ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById("modify-library-response");
  updateManagementToolsResponse(responseEle, "Processing...", null);

  // Check if conversation is already in library
  const { exists, error } = await checkConversationInLibrary(
    inputValue,
    library
  );
  if (exists) {
    let errorMsg = `Conversation ID '${inputValue}' already exists in ${library} library!`;
    console.error("[TIL] Error adding to library", errorMsg);
    updateManagementToolsResponse(responseEle, errorMsg, false);
    return errorMsg;
  } else if (error) {
    console.error("[TIL] Error adding to library", error);
    updateManagementToolsResponse(responseEle, error.message || error, false);
    return error;
  }
  console.info("[TIL] Conversation not in library, proceeding to add");

  // Get conversation details
  let conversations = await processConversations(inputValue);
  const conversation = conversations[0];
  if (!conversation) {
    let errorMsg = `Conversation ID '${inputValue}' not found!`;
    console.error("[TIL] Error adding to library", errorMsg);
    updateManagementToolsResponse(responseEle, errorMsg, false);
    return errorMsg;
  }
  console.debug("[TIL] Conversation processed", conversation);

  const flattenedConversation = flattenConversation(conversation);

  // Add library and tags to flattened conversation
  flattenedConversation.library_type = library;
  flattenedConversation.tags = tags;

  console.debug("[TIL] Row prepped for import", flattenedConversation);

  try {
    await createDatatableRow(datatableId, flattenedConversation);
    const newRow = await getDatatableRow(inputValue, false);
    populateTablesAndHandleAlerts(
      testMode ? [flattenedConversation] : [newRow],
      true
    );

    updateManagementToolsResponse(
      responseEle,
      `Added '${inputValue}' to ${library} library`,
      true
    );
    console.info("[TIL] Added to library");
  } catch (error) {
    console.error("[TIL] Error adding to library!", error);
    updateManagementToolsResponse(responseEle, error.message || error, false);
    return error;
  }
}

// Function to handle delete from library button click event
async function deleteFromLibraryHandler(library, inputValue) {
  console.info(`[TIL] Deleting ${inputValue} from ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById("modify-library-response");
  updateManagementToolsResponse(responseEle, "Processing...", null);

  try {
    if (testMode) {
      // Don't check on test mode
      await deleteDatatableRow(datatableId, inputValue);
      removeDomTableRow(`${library}-table`, inputValue);
      updateManagementToolsResponse(
        responseEle,
        `Deleted '${inputValue}' from ${library} library`,
        true
      );
      console.info("[TIL] Deleted from library");
      return;
    }

    // Check if conversation is already in the library
    const { exists, error } = await checkConversationInLibrary(
      inputValue,
      library
    );
    if (!exists) {
      let errorMsg = `Conversation ID '${inputValue}' does not exist in ${library} library!`;
      console.error("[TIL] Error deleting from library", errorMsg);
      updateManagementToolsResponse(responseEle, errorMsg, false);
      return errorMsg;
    } else if (error) {
      console.error("[TIL] Error deleting from library", error);
      updateManagementToolsResponse(responseEle, error.message || error, false);
      return error;
    }
    console.info("[TIL] Conversation found in library, proceeding to delete");

    // Delete from library logic here
    await deleteDatatableRow(datatableId, inputValue);
    removeDomTableRow(`${library}-table`, inputValue);
    updateManagementToolsResponse(
      responseEle,
      `Deleted '${inputValue}' from ${library} library`,
      true
    );
    console.info("[TIL] Deleted from library");
  } catch (error) {
    console.error("[TIL] Error deleting from library - ", error);
    updateManagementToolsResponse(responseEle, error.message || error, false);
    return error;
  }
}

// Function to handle library modification button click event
export async function modifyLibraryHandler() {
  console.info("[TIL] Modifying library");

  // Get library, action, conversation id and tags list
  const library = document.querySelector(
    'input[name="library-radio"]:checked'
  ).value;
  const action = document.querySelector(
    'input[name="action-radio"]:checked'
  ).value;
  const inputValue = document.getElementById(
    "modify-library-interaction-id"
  ).value;
  const tagsInput = selectedTags;

  let tags;
  if (tagsInput.length === 0) {
    tags = "-";
  } else {
    tags = tagsInput.join("|||");
  }

  console.log("[TIL] Library:", library);
  console.log("[TIL] Action:", action);
  console.log("[TIL] Conversation ID:", inputValue);
  console.log("[TIL] Tags:", tags);

  if (action === "add") {
    await addToLibraryHandler(library, inputValue, tags);
  }
  if (action === "delete") {
    await deleteFromLibraryHandler(library, inputValue);
  }
}

// Function to refresh all libraries
export async function refreshLibraries() {
  console.info("[TIL] Refreshing libraries");
  const responseEle = document.getElementById("refresh-libraries-response");
  updateManagementToolsResponse(responseEle, "Processing...", null);

  // Initialize variables
  let rows;
  let conversations;
  let response = {};

  // Get all rows from the datatable and process them
  console.log("[TIL] Processing library conversations");
  try {
    rows = await getDatatableRows(false);
    console.debug("[TIL] Rows returned", rows);
    const conversationIds = rows.map((row) => row.key);
    conversations = await processConversations(conversationIds.join(","));
    console.debug("[TIL] Conversations processed", conversations);
  } catch (error) {
    console.error("[TIL] Error refreshing libraries - ", error);
    updateManagementToolsResponse(responseEle, error.message || error, false);
    return error;
  }

  // Match processed conversations to the datatable rows
  console.log("[TIL] Matching conversations to datatable rows");
  response.errors = [];
  response.refreshedConversations = [];

  if (rows && rows.length > 0) {
    rows.forEach((row) => {
      console.debug(`[TIL] Matching conversation id '${row.key}'`);
      const conversationRow = conversations.find(
        (conv) => conv.conversation_id === row.key
      );
      try {
        if (conversationRow) {
          const flattenedConversation = flattenConversation(conversationRow);
          flattenedConversation.library_type = row.library_type;
          flattenedConversation.tags = row.tags;
          console.debug("[TIL] Matched conversation", flattenedConversation);
          response.refreshedConversations.push(flattenedConversation);
        } else {
          console.warn("[TIL] No matching conversation found for row!", row);
          row.error = "No matching conversation found";
          response.errors.push(row);
        }
      } catch (error) {
        console.error(
          "[TIL] Error matching conversation to datatable row",
          error
        );
        row.error = error.message || error;
        response.errors.push(row);
      }
    });
  }

  // Update the datatable with the refreshed conversations
  console.log("[TIL] Updating datatable with refreshed data");
  const updatedKeys = new Set();
  for (const conversation of response.refreshedConversations) {
    if (!updatedKeys.has(conversation.key)) {
      try {
        await updateDatatableRow(conversation.key, conversation);
        updatedKeys.add(conversation.key);
      } catch (error) {
        console.error(
          "[TIL] Error updating datatable with refreshed data - ",
          error
        );
        updateManagementToolsResponse(
          responseEle,
          error.message || error,
          false
        );
        return error;
      }
    }
  }

  // Populate the table with refreshed data
  console.log("[TIL] Populating tables with refreshed data");
  let newRows = await getDatatableRows(false);

  populateTablesAndHandleAlerts(newRows, false);

  if (response.errors.length > 0) {
    console.warn("[TIL] Errors refreshing libraries", response.errors);
    updateManagementToolsResponse(
      responseEle,
      "Errors while refreshing libraries - see JSON download for details",
      false
    );
  } else {
    updateManagementToolsResponse(
      responseEle,
      "Libraries refreshed successfully!",
      true
    );
  }
  downloadObjectAsJson(response, "refresh-libraries");
  console.info("[TIL] Libraries refreshed");
}
// Function to download the datatable schema as a JSON file
export async function downloadDatatableSchema() {
  console.info("[TIL] Downloading datatable schema");

  const schema = await generateDatatableSchema();
  downloadObjectAsJson(schema, "datatable-schema");
}

// Function to validate the datatable schema
export async function validateDatatable() {
  console.info("[TIL] Validating datatable");
  const responseEle = document.getElementById("validate-datatable-response");
  updateManagementToolsResponse(responseEle, "Processing...", null);

  try {
    const validationResponse = await validateDatatableSchema();
    console.log("[TIL] Datatable schema validated");

    if (!validationResponse.valid) {
      updateManagementToolsResponse(
        responseEle,
        "Datatable schema invalid - check console for details",
        false
      );
      downloadObjectAsJson(validationResponse, "datatable-validation");
    }

    updateManagementToolsResponse(responseEle, "Datatable schema valid", true);
  } catch (error) {
    console.error("[TIL] Error validating datatable schema", error);
    updateManagementToolsResponse(responseEle, error, false);
    return error;
  }
}

// Function to migrate the datatable
export async function migrateDatatable() {
  console.info("[TIL] Migrating datatable");
  const responseEle = document.getElementById("migrate-datatable-response");
  updateManagementToolsResponse(responseEle, "Processing...", null);

  try {
    // Validate datatable schema
    updateManagementToolsResponse(
      responseEle,
      "Validating datatable schema",
      null
    );
    const validationResponse = await validateDatatableSchema();

    updateManagementToolsResponse(responseEle, "Making datatable", null);
    await makeDatatable(validationResponse);
    console.log("[TIL] Datatable migrated");

    updateDatatableRow(responseEle, "Refreshing libraries", null);
    await refreshLibraries();

    updateManagementToolsResponse(responseEle, "Datatable migrated", true);
  } catch (error) {
    console.error("[TIL] Error migrating datatable", error);
    updateManagementToolsResponse(responseEle, error.message || error, false);
  }
}

// Function to open the datatable config in a new tab
export async function openDatatableConfig() {
  console.info("[TIL] Opening datatable config");

  const region = sessionStorage.getItem("gc_region");
  const datatableId = sessionStorage.getItem("gc_datatable");

  const anchor = document.createElement("a");
  anchor.href = `https://apps.${region}/directory/#/admin/routing/datatables/${datatableId}`;
  anchor.target = "_blank";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
}

// Function to open the datatable rows in a new tab
export async function openDatatableRows() {
  console.info("[TIL] Opening datatable rows");

  const region = sessionStorage.getItem("gc_region");
  const datatableId = sessionStorage.getItem("gc_datatable");

  const anchor = document.createElement("a");
  anchor.href = `https://apps.${region}/directory/#/admin/routing/datatables/${datatableId}/rows`;
  anchor.target = "_blank";
  anchor.style.display = "none";

  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
}
