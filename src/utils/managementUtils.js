// managementUtils.js
// Description: Utility for management operations

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules
import { updateDatatable, createDatatable } from "../modules/architect.js";

// Utility modules

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Flatten the expected schema
export async function flattenSchema(schema) {
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
    "name": "TIL Datatable",
    "schema": {
      "$schema": "http://json-schema.org/draft-04/schema#",
      "type": "object",
      "additionalProperties": false,
      "properties": properties,
      "required": ["key"],
    },
  };

  console.debug("[TIL] Datatable schema created", datatable);

  // Download the schema in JSON format
  downloadObjectAsJson(datatable, "datatable-schema");
}

// Function to make datatable
export async function makeDatatable() {
  console.log("[TIL] Making datatable");

  // Get current time in milliseconds
  const now = new Date().getTime();

  // Define the datatable config
  const datatableConfig = applicationConfig.datatable;
  const datatableName = datatableConfig.name;
  const divisionId = datatableConfig.divisionId;

  // Define current / old datatable info
  const oldId = sessionStorage.getItem("gc_datatable");
  const currentSchema = datatableConfig.currentSchema;

  // Generate the new datatable schema
  const schema = await generateDatatableSchema();

  // Update the schema with the name and division ID
  schema.name = `${datatableName} (new-${now})`;
  schema.division.id = divisionId;

  // Update the name of the old datatable
  await updateDatatable(oldId, { name: `${datatableName} (old-${now})` });

  // Create a new datatable
  const newDatatable = await createDatatable(schema);

  // Update the application config with the new datatable info and save it

  // Update the integration URL with the new datatable ID
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
