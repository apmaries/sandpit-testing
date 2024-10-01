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
        dataType: schema[category][key].dataType,
        displayOrder: schema[category][key].displayOrder,
      };
    }
  }
  return flatSchema;
}

// Function to generate datatable schema
export async function generateDatatableSchema() {
  console.log("[TIL] Generating datatable schema");

  const config = applicationConfig.datatable;
  const dtFields = await flattenSchema(config.parameters);
  const properties = {};

  for (const [key, field] of Object.entries(dtFields)) {
    properties[key] = {
      "title": key === "key" ? "conversation_id" : key,
      "type": field.dataType,
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

// Function to validate datatable schema
export async function validateDatatableSchema() {
  console.log("[TIL] Validating datatable schema");
  let datatable;

  // Define the expected schema
  const expectedSchema = await flattenSchema(
    applicationConfig.datatable.parameters
  );
  console.debug("[TIL] Expected schema", expectedSchema);

  // Initialize response object
  let response = {
    valid: false,
    errors: { toRemove: [], toAdd: [] },
  };

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
    response.valid = false;
    return response;
  }

  // Define the current schema
  const currentSchema = datatable.schema.properties;
  console.debug("[TIL] Current schema", currentSchema);

  // Validate the schema
  for (const key in currentSchema) {
    if (!expectedSchema[key]) {
      console.warn("[TIL] Unexpected key found in schema", key);
      response.errors.toRemove.push({
        title: key,
        dataType: currentSchema[key].type,
      });
    } else if (currentSchema[key].type !== expectedSchema[key].dataType) {
      response.errors.toRemove.push({
        title: key,
        dataType: currentSchema[key].type,
      });
    }
  }

  for (const key in expectedSchema) {
    if (!currentSchema[key]) {
      response.errors.toAdd.push({
        title: key,
        dataType: expectedSchema[key].type,
      });
    }
  }

  if (response.errors.toRemove.length > 0 || response.errors.toAdd.length > 0) {
    console.warn("[TIL] Schema validation failed with errors");
    response.errors.toRemove.forEach((mismatch) =>
      console.debug(`[TIL] Mismatched key:`, mismatch)
    );
    response.errors.toAdd.forEach((missing) =>
      console.debug(`[TIL] Missing key:`, missing)
    );

    return response;
  }

  response.valid = true;
  console.log("[TIL] Schema validation passed", response);
  return response;
}

// Function to make datatable
export async function makeDatatable(validationResponse) {
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
    console.log(`[TIL] Found old datatable '${oldId}'`);
    // Define the datatable config
    datatableName = datatableConfig.name;
    const divisionId = datatableConfig.divisionId;

    // Get the current datatable rows
    rows = await getDatatableRows(false);

    // Modify existing rows to new schema
    for (let row of rows) {
      // Add new properties to the row
      for (const key of validationResponse.errors.toAdd) {
        let keyTitle = key.title;
        row[keyTitle] = "";
      }

      // Remove obsolete properties from the row
      for (const key of validationResponse.errors.toRemove) {
        let keyTitle = key.title;
        delete row[keyTitle];
      }

      // Update row keys with default values
      for (const key in row) {
        // Skip key and type
        if (key === "key" || key === "library_type") continue;

        // Set default value based on type
        let keyType = schema.schema.properties[key].type;
        row[key] = keyType === "string" ? "-" : 0;
      }

      console.debug("[TIL] Modified row", row);
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
    console.log(`[TIL] Importing ${rows.length} rows from old datatable`);
    let counter = 0; // Initialize counter
    for (const row of rows) {
      counter++; // Increment counter
      console.debug(
        `[TIL] Creating row ${counter} of ${rows.length} with body`
      );
      await createDatatableRow(newDatatableResponse.id, row);
    }

    // Placeholder for refresh function
  }

  // Update application config with the new datatable info
  applicationConfig.datatable.datatable = newDatatableResponse;

  // Update the integration URL with the new datatable ID
  await updateIntegration();
}
