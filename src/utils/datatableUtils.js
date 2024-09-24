// datatableUtils.js
// Description: Utility for datatable operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { getDatatable } from "../modules/architect.js";

// Utility modules
import { updateManagementToolsResponse } from "./domUtils.js";
import { flattenSchema } from "./managementUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Function to validate datatable schema
export async function validateDatatableSchema() {
  console.log("[TIL] Validating datatable schema");
  let datatable;

  // Define the expected schema
  const expectedSchema = await flattenSchema(
    applicationConfig.datatable.datatableColumns
  );
  console.debug("[TIL] Expected schema", expectedSchema);

  // Get the datatable
  try {
    datatable = await getDatatable();
  } catch (error) {
    console.error("[TIL] Error getting datatable", error);
    throw error;
  }

  // Define the current schema
  const currentSchema = datatable.schema.properties;
  applicationConfig.datatable.currentSchema = datatable; // store in app config for updating later (if needed)

  // Validate the schema
  const mismatches = [];

  for (const key in currentSchema) {
    if (!expectedSchema[key]) {
      mismatches.push(`Unexpected key: ${key}`);
    } else if (currentSchema[key].type !== expectedSchema[key].type) {
      mismatches.push(
        `Type mismatch for key ${key}: expected ${expectedSchema[key].type}, got ${currentSchema[key].type}`
      );
    }
  }

  for (const key in expectedSchema) {
    if (!currentSchema[key]) {
      mismatches.push(`Missing key: ${key}`);
    }
  }

  if (mismatches.length > 0) {
    console.log(
      "[TIL] Schema validation failed with the following mismatches:"
    );
    mismatches.forEach((mismatch) => console.log(`[TIL] Misatch: ${mismatch}`));

    return false;
  }

  console.log("[TIL] Schema validation passed");
  return true;
}
