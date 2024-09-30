// objects.js
// Description: Utility module to handle objects api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { objectsApi } from "../app.js";
import { t_objectsApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

export async function getDivisions(divisionIds) {
  console.log(`[TIL] Getting divisions`);
  let divisions = [];

  let opts = {};

  if (divisionIds) {
    opts["id"] = divisionIds;
    opts["pageSize"] = divisionIds.length;
    opts["pageNumber"] = 1;
  }

  if (testMode) {
    // Get divisions using test API
    let t_response = await t_objectsApi.getAuthorizationDivisions();
    let allDivisions = t_response.entities;

    // Filter the divisions to match the provided divisionIds
    divisions = allDivisions.filter((division) =>
      divisionIds.includes(division.id)
    );

    // Map to return only division id and name
    return divisions.map((division) => ({
      id: division.id,
      name: division.name,
    }));
  }

  try {
    let response = await objectsApi.getAuthorizationDivisions(opts);
    divisions = response.entities;
    console.debug("[TIL] Divisions returned", divisions);
  } catch (error) {
    throw error;
  }

  // Map to return only division id and name
  return divisions.map((division) => ({
    id: division.id,
    name: division.name,
  }));
}
