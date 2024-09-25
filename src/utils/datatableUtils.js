// datatableUtils.js
// Description: Utility for datatable operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import {
  getDatatable,
  createDatatable,
  updateDatatable,
  getDatatableRows,
  createDatatableRow,
} from "../modules/architect.js";
import { updateIntegration } from "../modules/integrations.js";

// Utility modules
import { updateManagementToolsResponse } from "./domUtils.js";

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Flatten the expected schema
async function flattenSchema(schema) {
  const flatSchema = {};
  for (const category in schema) {
    for (const key in schema[category]) {
      flatSchema[key] = {
        type: schema[category][key].type,
        displayOrder: schema[category][key].displayOrder,
      };
    }
  }
  return flatSchema;
}

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
    applicationConfig.datatable.datatable = datatable;
  } catch (error) {
    if (error.status === 404) {
      console.log("[TIL] Datatable not found!");

      // Update application config to remove datatable specifics
      applicationConfig.datatable.datatable = "";
      sessionStorage.removeItem("gc_datatable");
    } else {
      throw new Error("[TIL] Fatal error getting datatable :(");
    }
    return false;
  }

  // Define the current schema
  const currentSchema = datatable.schema.properties;

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

// Function to generate datatable schema
export async function generateDatatableSchema() {
  console.log("[TIL] Generating datatable schema");

  const config = applicationConfig.datatable;

  const dtFields = await flattenSchema(config.datatableColumns);

  const properties = {};

  for (const [key, field] of Object.entries(dtFields)) {
    properties[key] = {
      "title": key === "key" ? "conversation_id" : key,
      "type": field.type,
      "$id": `/properties/${key === "key" ? "conversation_id" : key}`,
      "displayOrder": field.displayOrder,
    };

    // Add specific attributes based on the field type
    if (field.type === "string") {
      properties[key].maxLength = 256;
      properties[key].minLength = 1;
    } else if (field.type === "integer") {
      properties[key].maximum = 999999999999999;
      properties[key].minimum = -999999999999999;
    } else if (field.type === "number") {
      properties[key].default = 0;
      properties[key].maximum = 9e39;
      properties[key].minimum = -9e39;
    }
  }

  const datatable = {
    "schema": {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "additionalProperties": false,
      "properties": properties,
      "required": ["key"],
    },
  };

  console.debug("[TIL] Datatable schema created", datatable);

  return datatable;
}

// Function to make datatable
export async function makeDatatable() {
  console.log("[TIL] Making datatable");
  const datatableConfig = applicationConfig.datatable.datatable;
  let rows;

  // Get current time in milliseconds
  const now = new Date().getTime();

  // Get the old datatable ID
  const oldId = sessionStorage.getItem("gc_datatable");

  // Generate the new datatable schema
  let schema = await generateDatatableSchema();

  // Create the new datatable body
  let datatableName = "TIL Datatable";
  let newBody = {
    name: `${datatableName} (new-${now})`,
    schema: schema.schema,
  };

  // If there is an old datatable, update it
  if (oldId) {
    console.log("[TIL] Old datatable found", oldId);
    // Define the datatable config
    datatableName = datatableConfig.name;
    const divisionId = datatableConfig.divisionId;

    // Get the current datatable rows
    rows = await getDatatableRows();

    // Modify existing rows to new schema
    for (const row of rows) {
      for (const key in row) {
        // Remove keys that are not in the new schema
        if (!schema.schema.properties[key]) {
          delete row[key];
        }

        // Add new keys that are missing in the row
        else if (!row[key] && schema.schema.properties[key]) {
          row[key] = schema.schema.properties[key].type === "string" ? "-" : 0;
        }

        // Add any remaining keys with default values
        else {
          row[key] = schema.schema.properties[key].type === "string" ? "-" : 0;
        }
      }
    }

    // Update name in old datatable body
    datatableConfig.name = `${datatableName} (old-${now})`;

    // Update the old datatable
    console.debug("[TIL] Updating old datatable with body", datatableConfig);
    await updateDatatable(oldId, datatableConfig);

    // Update the new datatable body with the division ID
    newBody.division = { id: divisionId };
  }

  // Create a new datatable
  console.debug("[TIL] Creating new datatable with body", newBody);
  const newDatatableResponse = await createDatatable(newBody);
  console.log("[TIL] New datatable created", newDatatableResponse);

  // Import the rows from the old datatable
  if (rows) {
    console.log("[TIL] Importing rows from old datatable");
    for (const row of rows) {
      console.debug("[TIL] Creating row with body", row);
      await createDatatableRow(newDatatableResponse.id, row);
    }

    // Placeholder for refresh function
  }

  // Update application config with the new datatable info
  applicationConfig.datatable.datatable = newDatatableResponse;

  // Update the integration URL with the new datatable ID
  await updateIntegration();
}
