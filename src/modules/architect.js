// architect.js
// Description: Utility module to handle architect api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { architectApi } from "../app.js";
import { t_architectApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

// Get datatable schema
export async function getDatatable() {
  console.log("[TIL] Getting datatable");
  let datatable;

  let opts = {
    "expand": "schema", // String | Expand instructions for the result
  };

  try {
    if (testMode) {
      // Get datatable using test API
      datatable = await t_architectApi.getFlowsDatatable();
    } else {
      let datatableId = sessionStorage.getItem("gc_datatable");
      datatable = await architectApi.getFlowsDatatable(datatableId, opts);
    }
  } catch (error) {
    console.error("[TIL] Error getting datatable. ", error);
    throw error;
  }

  // Update application config with datatable specifics
  applicationConfig.datatable.name = datatable.name;
  applicationConfig.datatable.id = datatable.id;
  console.log("[TIL] Datatable returned", datatable);
  console.log(
    `[TIL] Updated application config with datatable: ${applicationConfig.datatable.name} (${applicationConfig.datatable.id})`
  );

  return datatable;
}

// Return datatable rows
export async function getDatatableRows() {
  console.log("[TIL] Getting datatable rows");
  let rows = [];

  if (testMode) {
    // Get datatable rows using test API
    let t_response = await t_architectApi.getFlowsDatatableRows();
    rows = t_response.entities;
    console.log("[TIL] Datatable rows returned", rows);
    return rows;
  }

  let datatableId = sessionStorage.getItem("gc_datatable");
  let opts = {
    "pageNumber": 1, // Number | Page number
    "pageSize": 500, // Number | Page size
    "showbrief": false, // Boolean | If true returns just the key value of the row
  };

  try {
    let response = await architectApi.getFlowsDatatableRows(datatableId, opts);
    rows = response.entities; // Access the entities array
    console.log("[TIL] Datatable rows returned", rows);
  } catch (error) {
    console.error("[TIL] Error getting datatable rows. ", error);
    throw error;
  }
}

// Update datatable row
export async function updateDatatableRow(rowId, body) {
  if (testMode) {
    console.log("[TIL] Updating datatable row", rowId);
    return;
  }

  let datatableId = sessionStorage.getItem("gc_datatable");

  try {
    await architectApi.updateFlowsDatatableRow(datatableId, rowId, body);
    console.log("[TIL] Datatable row updated", rowId);
  } catch (error) {
    console.error("[TIL] Error updating datatable row. ", error);
    throw error;
  }
}
