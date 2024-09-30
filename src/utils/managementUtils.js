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
import { populateDomTable, updateManagementToolsResponse } from "./domUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Function to flatten the conversation schema
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

// Function to handle add to library button click event
export async function addToLibraryHandler(library, inputValue) {
  console.log(`[TIL] Adding ${inputValue} to ${library} library`);
  const datatableId = sessionStorage.getItem("gc_datatable");
  const responseEle = document.getElementById(
    `modify-${library}-library-response`
  );
  // Add to library logic here

  // Check if conversation is already in library
  const existingRow = await getDatatableRow(inputValue, true);
  if (existingRow.key === inputValue) {
    let error = `Conversation ID '${inputValue}' already exists in ${library} library!`;
    console.error("[TIL] Error adding to library", error);
    updateManagementToolsResponse(responseEle, error, false);
    return error;
  }

  // Get conversation details
  let conversations = await processConversations(inputValue);
  const conversation = conversations[0];
  if (!conversation) {
    let error = `Conversation ID '${inputValue}' not found!`;
    console.error("[TIL] Error adding to library", error);
    updateManagementToolsResponse(responseEle, error, false);
    return error;
  }
  console.log("[TIL] Conversation processed", conversation);

  const flattenedConversation = flattenConversation(conversation);

  // Add library to flattened conversation
  flattenedConversation.type = library;

  console.debug("[TIL] Row prepped for import", flattenedConversation);

  try {
    await createDatatableRow(datatableId, flattenedConversation);
    const newRow = await getDatatableRow(inputValue, false);
    console.debug("[TIL] FlattenedConversation", flattenedConversation);
    console.debug("[TIL] New row added", newRow);

    populateDomTable(`${library}-table`, [newRow]);

    updateManagementToolsResponse(
      responseEle,
      `Added '${inputValue}' to ${library} library`,
      true
    );
  } catch (error) {
    console.error("[TIL] Error adding to library - ", error);
    updateManagementToolsResponse(responseEle, error);
    return error;
  }
}

// FUnction to handle delete from library button click event
export async function deleteFromLibraryHandler(library, inputValue) {
  console.log(`[TIL] Deleting ${inputValue} from ${library} library`);
  // Delete from library logic here

  let delResponse = await deleteDatatableRow(inputValue);

  // Update DOM response
  let responseEle = document.getElementById(
    `modify-${library}-library-response`
  );
  updateManagementToolsResponse(responseEle, delResponse);
}

// Function to download an object as a JSON file
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

// Function to download the datatable schema as a JSON file
export async function downloadDatatableSchema() {
  console.log("[TIL] Downloading datatable schema");

  const schema = await generateDatatableSchema();
  downloadObjectAsJson(schema);
}

// Function to migrate the datatable
export async function migrateDatatable() {
  console.log("[TIL] Migrating datatable");

  try {
    if (testMode) {
      return "Datatable schema updated";
    }

    await makeDatatable();
    console.log("[TIL] Datatable migrated");
    return "Datatable schema updated";
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
