// app.js
// Description: The main entry point file that initializes the app and starts the main logic.

// Shared state modules
import { applicationConfig } from "./core/configManager.js";

// Core modules
import { initializeTestMode } from "./core/testManager.js";

// Api modules
import { getIntegration } from "./modules/integrations.js";
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
const integrationsApi = new platformClient.IntegrationsApi();
const objectsApi = new platformClient.ObjectsApi();
const recordingApi = new platformClient.RecordingApi();
const staApi = new platformClient.SpeechTextAnalyticsApi();
const usersApi = new platformClient.UsersApi();

// Redirect URL
const redirect_url = window.location.origin + window.location.pathname;

// URL parameters
let url = new URL(document.location.href);
let gc_region = url.searchParams.get("gc_region");
let gc_client = url.searchParams.get("gc_client");
let gc_integration = url.searchParams.get("gc_integration");
let gc_datatable = url.searchParams.get("gc_datatable");
let til_adminsGroupId = url.searchParams.get("til_adminsGroupId");
let til_adminsIds = url.searchParams.get("til_adminsIds");

// Getting and setting the GC details from dynamic URL and session storage
gc_region = gc_region || sessionStorage.getItem("gc_region");
gc_client = gc_client || sessionStorage.getItem("gc_clientId");
gc_datatable = gc_datatable || sessionStorage.getItem("gc_datatable");
til_adminsGroupId =
  til_adminsGroupId || sessionStorage.getItem("til_adminsGroupId");
til_adminsIds = til_adminsIds || sessionStorage.getItem("til_adminsIds");

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

      client.config.logger.log_level =
        client.config.logger.logLevelEnum.level.LTrace;
      client.config.logger.log_format =
        client.config.logger.logFormatEnum.formats.JSON;
      client.config.logger.log_request_body = true;
      client.config.logger.log_response_body = true;
      client.config.logger.log_to_console = true;
      client.config.logger.setLogger(); // To apply above changes

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
  integrationsApi,
  objectsApi,
  recordingApi,
  staApi,
  usersApi,
};

async function runApp() {
  console.log("[TIL] Application started");

  try {
    // Run getIntegration and getUser in parallel
    const [integrationConfig, appUser] = await Promise.all([
      getIntegration(),
      getUser(),
    ]);

    // Use the results
    document.getElementById("welcome-div").innerText =
      "Welcome, " + appUser.name + "!";
    applicationConfig.integration = integrationConfig;

    console.log("[TIL] Application config:", applicationConfig);

    // Check if datatable is null
    if (!gc_datatable) {
      console.warn("[TIL] Datatable is not set. Creating new datatable");

      // Create datatable
      await makeDatatable();
    } else {
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
  } catch (error) {
    console.error("[TIL] An error occurred:", error);
    // Stop the application if either getIntegration or getUser fails
    return;
  }
}
