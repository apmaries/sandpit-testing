// managementUtils.js
// Description: Utility for management operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import {
  createDatatableRow,
  deleteDatatableRow,
  getDatatableRow,
} from "../modules/architect.js";
import { processConversations } from "../modules/conversations.js";

// Utility modules
import { generateDatatableSchema, makeDatatable } from "./datatableUtils.js";
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
  const flattened = {};

  Object.keys(conversation).forEach((group) => {
    Object.keys(conversation[group]).forEach((key) => {
      const column = conversation[group][key];
      flattened[`${key}`] = column;
    });
  });

  return flattened;
}

// Helper function to download an object as a JSON file
async function downloadObjectAsJson(obj) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "datatable-schema.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Helper function to check if a conversation is in the specified library
async function checkConversationInLibrary(inputValue, library) {
  const existingRow = await getDatatableRow(inputValue, true);
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
}

// Function to handle add to library button click event
export async function addToLibraryHandler(library, inputValue) {
  console.info(`[TIL] Adding ${inputValue} to ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById(
    `modify-${library}-library-response`
  );

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
    updateManagementToolsResponse(responseEle, error, false);
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
  console.log("[TIL] Conversation processed", conversation);

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
  } catch (error) {
    console.error("[TIL] Error adding to library - ", error);
    updateManagementToolsResponse(responseEle, error, false);
    return error;
  }
}

// Function to handle delete from library button click event
export async function deleteFromLibraryHandler(library, inputValue) {
  console.log(`[TIL] Deleting ${inputValue} from ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById(
    `modify-${library}-library-response`
  );

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
      updateManagementToolsResponse(responseEle, error, false);
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
  } catch (error) {
    console.error("[TIL] Error deleting from library - ", error);
    updateManagementToolsResponse(responseEle, error, false);
    return error;
  }
}

// Function to download the datatable schema as a JSON file
export async function downloadDatatableSchema() {
  console.log("[TIL] Downloading datatable schema");

  const schema = await generateDatatableSchema();
  downloadObjectAsJson(schema);
}

// Function to migrate the datatable
export async function migrateDatatable() {
  console.log("[TIL] Migrating datatable");
  let response;

  try {
    if (testMode) {
      response = "Datatable migrated";
      return response;
    }

    await makeDatatable();
    console.log("[TIL] Datatable migrated");
    response = "Datatable migrated";
    return response;
  } catch (error) {
    return error;
  }
}

// Function to open the datatable config in a new tab
export async function openDatatableConfig() {
  console.log("[TIL] Opening datatable config");

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
  console.log("[TIL] Opening datatable rows");

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
