// managementUtils.js
// Description: Utility for management operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { deleteDatatableRow } from "../modules/architect.js";
import { processConversationData } from "../modules/conversations.js";
import { processStaData } from "../modules/sta.js";
import { processRecordingData } from "../modules/recordings.js";

// Utility modules
import { generateDatatableSchema, makeDatatable } from "./datatableUtils.js";
import { updateManagementToolsResponse } from "./domUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Function to handle add to library button click event
export async function addToLibraryHandler(library, inputValue) {
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
