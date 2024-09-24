// managementUtils.js
// Description: Utility for management operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { updateDatatable, createDatatable } from "../modules/architect.js";

// Utility modules
import { generateDatatableSchema, makeDatatable } from "./datatableUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

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
