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
} from "../modules/architect.js";
import { processConversations } from "../modules/conversations.js";

// Utility modules
import {
  generateDatatableSchema,
  validateDatatableSchema,
  makeDatatable,
} from "./datatableUtils.js";
import {
  populateDomTable,
  removeDomTableRow,
  updateManagementToolsResponse,
} from "./domUtils.js";

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
export async function addToLibraryHandler(library, inputValue) {
  console.info(`[TIL] Adding ${inputValue} to ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById(
    `modify-${library}-library-response`
  );
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

  // Add library to flattened conversation
  flattenedConversation.library_type = library;

  console.debug("[TIL] Row prepped for import", flattenedConversation);

  try {
    await createDatatableRow(datatableId, flattenedConversation);
    const newRow = await getDatatableRow(inputValue, false);
    populateDomTable(
      `${library}-table`,
      testMode ? [flattenedConversation] : [newRow]
    );
    updateManagementToolsResponse(
      responseEle,
      `Added '${inputValue}' to ${library} library`,
      true
    );
    console.info("[TIL] Added to library");
  } catch (error) {
    console.error("[TIL] Error adding to library - ", error);
    updateManagementToolsResponse(responseEle, error.message || error, false);
    return error;
  }
}

// Function to handle delete from library button click event
export async function deleteFromLibraryHandler(library, inputValue) {
  console.info(`[TIL] Deleting ${inputValue} from ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById(
    `modify-${library}-library-response`
  );
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

// Function to refresh all libraries
export async function refreshLibraries() {
  console.info("[TIL] Refreshing libraries");
  const responseEle = document.getElementById("refresh-libraries-response");
  updateManagementToolsResponse(responseEle, "Processing...", null);

  // Initialize variables
  let rows;
  let conversations;

  // Get all rows from the datatable and process them
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
  if (rows && rows.length > 0) {
    rows.forEach((row) => {
      const conversationRow = conversations.find(
        (conv) => conv.details.key === row.key
      );
      if (conversationRow) {
        const flattenedConversation = flattenConversation(conversationRow);
        row.library_type = flattenedConversation.library_type;
      }
    });
  }
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
    console.error("[TIL] Error validating datatable schema - ", error);
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

    updateManagementToolsResponse(responseEle, "Datatable migrated", true);
  } catch (error) {
    console.error("[TIL] Error migrating datatable - ", error);
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
