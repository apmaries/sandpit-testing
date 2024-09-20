// datatableUtils.js
// Description: Utility for datatable operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { getDatatable } from "../modules/architect.js";

// Utility modules

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

  // Define the expected schema
  const expectedSchema = await flattenSchema(
    applicationConfig.datatable.datatableColumns
  );
  console.log("[TIL] Expected schema", expectedSchema);

  // Define the current schema
  const datatable = await getDatatable();
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

  console.log("Schema validation passed.");
  return true;
}

export async function makeDatatable() {
  console.log("[TIL] Making datatable");

  const config = applicationConfig.datatable;

  const dtName = config.name;
  const dtFields = await flattenSchema(config.datatableColumns);

  const properties = {};

  for (const [key, field] of Object.entries(dtFields)) {
    properties[key] = {
      "title": key,
      "type": field.type,
      "$id": `/properties/${key}`,
      "displayOrder": field.displayOrder,
    };

    // Add specific attributes based on the field type
    if (field.type === "string") {
      properties[key].maxLength = 256;
      properties[key].minLength = 1;
    } else if (field.type === "integer") {
      properties[key].maximum = 999999999999999;
      properties[key].minimum = -999999999999999;
    } else if (field.type === "decimal") {
      properties[key].default = 0;
      properties[key].maximum = 1e40;
      properties[key].minimum = -1e40;
    }
  }

  const datatable = {
    "name": dtName,
    "schema": {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "additionalProperties": false,
      "properties": properties,
      "required": ["key"],
    },
  };

  console.log("[TIL] Datatable created", datatable);

  return datatable;
}
