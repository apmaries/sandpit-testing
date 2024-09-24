// app.js
// Description: The main entry point file that initializes the app and starts the main logic.

// Shared state modules
import { applicationConfig } from "./core/configManager.js";

// Core modules
import { startSession } from "./core/sessionManager.js";
import { initializeTestMode } from "./core/testManager.js";

// Api modules
import { getUser } from "./modules/users.js";

// Utility modules
import {
  validateDatatableSchema,
  makeDatatable,
} from "./utils/datatableUtils.js";
import {
  makeDomTables,
  populateDomTable,
  resetCheckboxes,
} from "./utils/domUtils.js";
import {
  enableAddButtonEventListeners,
  enableDomTableCheckboxEventListeners,
  enableManagementToolsEventListeners,
} from "./utils/eventUtils.js";

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;
const platformClient = require("platformClient");
const client = platformClient.ApiClient.instance;
const architectApi = new platformClient.ArchitectApi();
const conversationsApi = new platformClient.ConversationsApi();
const objectsApi = new platformClient.ObjectsApi();
const recordingApi = new platformClient.RecordingApi();
const staApi = new platformClient.SpeechTextAnalyticsApi();
const usersApi = new platformClient.UsersApi();

// Redirect URL
const redirect_url = window.location.origin + window.location.pathname;

// Extract gc_region from document.referrer
const referrerUrl = document.referrer;
const gc_region = referrerUrl.slice(13, -1);
console.log(`[TIL] Genesys Cloud region: ${gc_region}`);

// URL parameters
let url = new URL(document.location.href);
let gc_client = url.searchParams.get("gc_client");
let gc_integration = url.searchParams.get("gc_integration");
let gc_datatable = url.searchParams.get("gc_datatable");
let til_adminsGroupId = url.searchParams.get("til_adminsGroupId");
let til_adminsIds = url.searchParams.get("til_adminsIds");

// Clear previous session storage
sessionStorage.clear();

// Setting the values in sessionStorage if they are provided
if (redirect_url) sessionStorage.setItem("redirect_url", redirect_url);
if (gc_region) sessionStorage.setItem("gc_region", gc_region);
if (gc_client) sessionStorage.setItem("gc_client", gc_client);
if (gc_integration) sessionStorage.setItem("gc_integration", gc_integration);
if (gc_datatable) sessionStorage.setItem("gc_datatable", gc_datatable);
if (til_adminsGroupId)
  sessionStorage.setItem("til_adminsGroupId", til_adminsGroupId);
if (til_adminsIds) sessionStorage.setItem("til_adminsIds", til_adminsIds);

export async function startApp() {
  console.log("[TIL] Starting application");

  if (testMode) {
    // Initialize test mode
    console.log("%c[TIL] Test mode enabled", "color: red");

    await initializeTestMode();
  } else {
    // Set environment and login to Genesys Cloud
    try {
      client.setEnvironment(gc_region);
      client.setPersistSettings(true, "_TIL_");

      // Set client logging
      /*
      client.config.logger.log_level =
        client.config.logger.logLevelEnum.level.LTrace;
      client.config.logger.log_format =
        client.config.logger.logFormatEnum.formats.JSON;
      client.config.logger.log_request_body = true;
      client.config.logger.log_response_body = true;
      client.config.logger.log_to_console = true;
      client.config.logger.setLogger(); // To apply above changes
      */

      console.log("%c[TIL] Logging in to Genesys Cloud", "color: green");
      await client.loginImplicitGrant(gc_client, redirect_url, {});
    } catch (err) {
      console.log("[TIL] Error: ", err);
    }
  }

  // Start session
  try {
    runApp();
  } catch (err) {
    console.log("[TIL] Error: ", err);
  }
}

export {
  architectApi,
  conversationsApi,
  objectsApi,
  recordingApi,
  staApi,
  usersApi,
};

async function runApp() {
  console.log("[TIL] Application started");

  // Get user details
  const appUser = await getUser();
  document.getElementById("welcome-div").innerText =
    "Welcome, " + appUser.name + "!";

  // Check if datatable is null
  if (!gc_datatable) {
    console.warn("[TIL] Datatable is not set. Creating new datatable");

    // Create datatable
    await makeDatatable();
  }

  // Check if datatable is valid
  else {
    console.log(`[TIL] Datatable ID = '${gc_datatable}'`);
    // Validate datatable schema
    const isValidTable = await validateDatatableSchema();
    if (!isValidTable) {
      console.warn(
        "[TIL] Datatable schema is not valid. Migrating to new datatable"
      );

      // Migrate datatable
      await makeDatatable();
    }
  }

  const isAdmin = applicationConfig.mode.isAdmin;

  // Create tables in DOM
  makeDomTables();
  resetCheckboxes();
  enableDomTableCheckboxEventListeners();

  // Enable admin features if user is an admin
  if (isAdmin) {
    // Find all elements with the 'admin-hidden' class
    const adminHiddenElements = document.querySelectorAll(".admin-hidden");

    // Update each element to replace 'admin-hidden' with 'admin-visible'
    adminHiddenElements.forEach((element) => {
      element.classList.remove("admin-hidden");
      element.classList.add("admin-visible");
    });

    // Enable admin features
    await enableAddButtonEventListeners();
    await enableManagementToolsEventListeners();

    console.log("[TIL] Admin features enabled");
  } else {
    console.log("[TIL] User is not admin");
  }
}
