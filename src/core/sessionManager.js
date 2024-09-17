// sessionHandler.js
// Description: Module for handling session-related logic

// Shared state modules
import { applicationConfig } from "./configManager.js";

// Api modules
import { getDatatableRows } from "../modules/architect.js";
import { getUser } from "../modules/users.js";

// Utility modules
import { populateTable } from "../utils/domUtils.js";

// Global variables
const testMode = applicationConfig.testMode;
("use strict");

export async function startSession() {
  console.log("[TIL] Starting session");

  // Run getUser and getDatatableRows concurrently
  const [appUser, rows] = await Promise.all([getUser(), getDatatableRows()]);

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
