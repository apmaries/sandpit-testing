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
  let datatableId = sessionStorage.getItem("gc_datatable");
  console.log(`[TIL] Getting datatable '${datatableId}'`);
  let datatable;

  let opts = {
    "expand": "schema", // String | Expand instructions for the result
  };

  try {
    if (testMode) {
      // Get datatable using test API
      datatable = await t_architectApi.getFlowsDatatable();
    } else {
      datatable = await architectApi.getFlowsDatatable(datatableId, opts);
    }
  } catch (error) {
    console.error("[TIL] Error getting datatable", error);
    throw error;
  }

  console.debug("[TIL] Datatable returned", datatable);

  return datatable;
}

// Udpate datatable
export async function updateDatatable(datatableId, body) {
  console.log("[TIL] Updating datatable");
  if (testMode) {
    return "Datatable schema updated";
  }

  try {
    await architectApi.putFlowsDatatable(datatableId, body);
    console.log("[TIL] Datatable schema updated");
    return "Datatable schema updated";
  } catch (error) {
    throw error;
  }
}

// Create a datatable
export async function createDatatable(body) {
  console.log("[TIL] Creating datatable");

  if (testMode) {
    return {
      "id": "16653eb4-2940-44f9-aaa7-31907ee537ab",
      "name": "TIL Datatable (new-1727144957329)",
      "division": {
        "id": "1c328efb-fcf3-4ac3-b5c2-987ff3c92afa",
        "name": "Bluth Company",
        "selfUri":
          "/api/v2/authorization/divisions/1c328efb-fcf3-4ac3-b5c2-987ff3c92afa",
      },
      "selfUri":
        "/api/v2/flows/datatables/16653eb4-2940-44f9-aaa7-31907ee537ab",
    };
  }

  try {
    const datatable = await architectApi.postFlowsDatatables(body);
    console.log("[TIL] Datatable created");
    return datatable;
  } catch (error) {
    throw error;
  }
}

// Return datatable rows
export async function getDatatableRows(brief) {
  console.log("[TIL] Getting datatable rows");
  let rows = [];

  if (testMode) {
    // Get datatable rows using test API
    let t_response = await t_architectApi.getFlowsDatatableRows();
    rows = t_response.entities;
    console.debug("[TIL] Datatable rows returned", rows);
    return rows;
  }

  let datatableId = sessionStorage.getItem("gc_datatable");
  let opts = {
    "pageNumber": 1, // Number | Page number
    "pageSize": 500, // Number | Page size
    "showbrief": brief, // Boolean | If true returns just the key value of the row
  };

  try {
    let response = await architectApi.getFlowsDatatableRows(datatableId, opts);
    rows = response.entities; // Access the entities array
    console.log("[TIL] Datatable rows returned", rows);
  } catch (error) {
    throw error;
  }

  return rows;
}

// Return datatable row
export async function getDatatableRow(rowId, brief) {
  console.log("[TIL] Getting datatable row", rowId);

  let opts = {
    "showbrief": brief, // Boolean | if true returns just the key field for the row
  };

  if (testMode) {
    // Get datatable row using test API
    let t_response = await t_architectApi.getFlowsDatatableRow(rowId);
    console.debug("[TIL] Datatable row returned", t_response);
    return t_response;
  }

  let datatableId = sessionStorage.getItem("gc_datatable");

  try {
    let response = await architectApi.getFlowsDatatableRow(
      datatableId,
      rowId,
      opts
    );
    console.debug("[TIL] Datatable row returned", response);
    return response;
  } catch (error) {
    throw error;
  }
}

// Create datatable row
export async function createDatatableRow(datatableId, row) {
  console.log("[TIL] Creating datatable row", row);

  if (testMode) {
    return "Datatable row created";
  }

  try {
    await architectApi.postFlowsDatatableRows(datatableId, row);
    console.debug("[TIL] Datatable row created", row);
    return;
  } catch (error) {
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
    throw error;
  }
}

// Delete datatable row
export async function deleteDatatableRow(rowId) {
  console.log("[TIL] Deleting datatable row", rowId);

  if (testMode) {
    return "Datatable row deleted";
  }

  let datatableId = sessionStorage.getItem("gc_datatable");

  try {
    let response = await architectApi.deleteFlowsDatatableRow(
      datatableId,
      rowId
    );
    return response;
  } catch (error) {
    return error;
  }
}
