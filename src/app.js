// app.js
// Description: The main entry point file that initializes the app and starts the main logic.

// Shared state modules
import { applicationConfig } from "./core/configManager.js";

// Core modules
import { initializeTestMode } from "./core/testManager.js";

// Api modules
import { getIntegration } from "./modules/integrations.js";
import { getUser } from "./modules/users.js";
import { getDatatableRows } from "./modules/architect.js";

// Utility modules
import {
  validateDatatableSchema,
  makeDatatable,
} from "./utils/datatableUtils.js";
import {
  makeDomTables,
  resetCheckboxes,
  populateTablesAndHandleAlerts,
} from "./utils/domUtils.js";
import {
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
let til_LibraryAdminsGroupId = url.searchParams.get("til_library_admins_group");
let til_integrationAdminsGroupId = url.searchParams.get(
  "til_integration_admins_group"
);
let til_integrationAdminsIds = url.searchParams.get(
  "til_integration_admins_ids"
);

// Getting and setting the GC details from dynamic URL and session storage
gc_region = gc_region || sessionStorage.getItem("gc_region");
gc_client = gc_client || sessionStorage.getItem("gc_clientId");
gc_datatable = gc_datatable || sessionStorage.getItem("gc_datatable");
til_LibraryAdminsGroupId =
  til_LibraryAdminsGroupId ||
  sessionStorage.getItem("til_libraryAdminsGroupId");
til_integrationAdminsGroupId =
  til_integrationAdminsGroupId ||
  sessionStorage.getItem("til_integrationAdminsGroupId");
til_integrationAdminsIds =
  til_integrationAdminsIds ||
  sessionStorage.getItem("til_integrationAdminsIds");

// Setting the values in sessionStorage if they are provided
if (redirect_url) sessionStorage.setItem("redirect_url", redirect_url);
if (gc_region) sessionStorage.setItem("gc_region", gc_region);
if (gc_client) sessionStorage.setItem("gc_client", gc_client);
if (gc_integration) sessionStorage.setItem("gc_integration", gc_integration);
if (gc_datatable) sessionStorage.setItem("gc_datatable", gc_datatable);
if (til_LibraryAdminsGroupId)
  sessionStorage.setItem("til_LibraryAdminsGroupId", til_LibraryAdminsGroupId);
if (til_integrationAdminsGroupId)
  sessionStorage.setItem(
    "til_integrationAdminsGroupId",
    til_integrationAdminsGroupId
  );
if (til_integrationAdminsIds) {
  sessionStorage.setItem("til_integrationAdminsIds", til_integrationAdminsIds);
}

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
      client.config.logger.log_file_path = "/logs/genesys_cloud_sdk.log";
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
    // Get and welcome user
    const appUser = await getUser();
    document.getElementById("welcome-div").innerText =
      "Welcome, " + appUser.name + "!";
    console.log("[TIL] Application config:", applicationConfig);

    const admin = applicationConfig.mode.admin.isAdmin;
    const adminType = applicationConfig.mode.admin.type;

    // Validate datatable schema
    const validationResponse = await validateDatatableSchema();
    if (!validationResponse.valid) {
      console.log("[TIL] Datatable schema is invalid");
      if (admin && adminType === "integration") {
        console.log("[TIL] Creating new datatable");
        await makeDatatable(validationResponse);
      } else {
        console.warn("[TIL] User does not have permission to create datatable");
        // Placeholder for handling datatable schema validation failure via notification
      }
    }

    if (admin) {
      console.log(`[TIL] ${appUser.name} is ${adminType} admin`);
    } else {
      console.log(`[TIL] ${appUser.name} is a user`);
    }

    // Enable admin features if user is an admin
    if (admin) {
      enableAdminFeatures(adminType);
      console.log("[TIL] Admin features enabled");
    } else {
      console.log("[TIL] User is not admin");
    }

    // Create tables in DOM
    makeDomTables();
    resetCheckboxes();
    enableDomTableCheckboxEventListeners();

    // Populate the table with data
    let rows = await getDatatableRows(false);
    await populateTablesAndHandleAlerts(rows, false);
  } catch (error) {
    console.error("[TIL] An error occurred:", error);
  } finally {
    // Ensure management tools are displayed and initialized
    await enableManagementToolsEventListeners();
  }
}

// Helper function to enable admin features
function enableAdminFeatures(adminType) {
  const libraryAdminHiddenElements = document.querySelectorAll(
    ".library-admin-hidden"
  );
  const integrationAdminHiddenElements = document.querySelectorAll(
    ".integration-admin-hidden"
  );

  if (adminType === "library") {
    libraryAdminHiddenElements.forEach((element) => {
      element.classList.remove("library-admin-hidden");
      element.classList.add("library-admin-visible");
    });
  }
  if (adminType === "integration") {
    integrationAdminHiddenElements.forEach((element) => {
      element.classList.remove("integration-admin-hidden");
      element.classList.add("integration-admin-visible");
    });
    libraryAdminHiddenElements.forEach((element) => {
      element.classList.remove("library-admin-hidden");
      element.classList.add("library-admin-visible");
    });
  }
}
