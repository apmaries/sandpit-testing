// sessionHandler.js
// Description: Module for handling session-related logic

// Shared state modules
import { applicationConfig } from "./configManager.js";

// Core modules
import { architectApi, usersApi } from "../app.js";
import { t_architectApi } from "./testManager.js";

// Utility modules
import { populateTable } from "../utils/tableUtils.js";

// Global variables
const testMode = applicationConfig.testMode;
("use strict");

export async function startSession() {
  console.log("[TIL] Starting session");
  let appUser = null;
  let rows = [];

  // Return user details
  async function getUser() {
    try {
      let user = await usersApi.getUsersMe({});
      console.log("[TIL] User details returned", user);
      appUser = user.name;
    } catch (error) {
      console.error("[TIL] Error getting user details. ", error);
      throw error;
    }
  }

  // Return datatable rows
  async function getDatatableRows() {
    let datatableId = sessionStorage.getItem("gc_datatable");
    let opts = {
      "pageNumber": 1, // Number | Page number
      "pageSize": 500, // Number | Page size
      "showbrief": false, // Boolean | If true returns just the key value of the row
    };

    try {
      let response = await architectApi.getFlowsDatatableRows(
        datatableId,
        opts
      );
      rows = response.entities; // Access the entities array
      console.log("[TIL] Datatable rows returned", rows);
    } catch (error) {
      console.error("[TIL] Error getting datatable rows. ", error);
      throw error;
    }
  }

  if (testMode) {
    // Get datatable rows using test API
    appUser = "Test User";
    let t_response = await t_architectApi.getFlowsDatatableRows();
    rows = t_response.entities;
    console.log("[TIL] Datatable rows returned", rows);
  } else {
    // Get user and datatable rows concurrently using Genesys Cloud API
    await Promise.all([getUser(), getDatatableRows()]);
  }

  document.getElementById("welcome-div").innerText =
    "Welcome, " + appUser + "!";

  // Delineate between good and bad records
  const goodRows = rows.filter((row) => row.type === "good");
  const badRows = rows.filter((row) => row.type === "bad");

  // Populate good and bad tables on session start
  console.log("[TIL] Populating tables with data");
  populateTable("good-table", goodRows);
  populateTable("bad-table", badRows);
}
