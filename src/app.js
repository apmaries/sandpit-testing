// app.js
// Description: The main entry point file that initializes the app and starts the main logic.

// Shared state modules
import { applicationConfig } from "./core/configManager.js";

// Core modules
import { startSession } from "./core/sessionManager.js";
import { initializeTestMode } from "./core/testManager.js";

// Utility modules
import { handleAddToLibraryClick } from "./utils/eventUtils.js";

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;
const platformClient = require("platformClient");
const client = platformClient.ApiClient.instance;
const architectApi = new platformClient.ArchitectApi();
const conversationsApi = new platformClient.ConversationsApi();
const staApi = new platformClient.SpeechTextAnalyticsApi();
const usersApi = new platformClient.UsersApi();

// URL parameters
let url = new URL(document.location.href);
let gc_region = url.searchParams.get("gc_region");
let gc_client = url.searchParams.get("gc_client");
let gc_datatable = url.searchParams.get("gc_datatable");
let til_adminsGroupId = url.searchParams.get("til_adminsGroupId");
let til_adminsIds = url.searchParams.get("til_adminsIds");

let redirect_url = window.location.origin + window.location.pathname;

// Getting and setting the GC details from dynamic URL and session storage
gc_region = gc_region || sessionStorage.getItem("gc_region");
gc_client = gc_client || sessionStorage.getItem("gc_clientId");
gc_datatable = gc_datatable || sessionStorage.getItem("gc_datatable");
til_adminsGroupId =
  til_adminsGroupId || sessionStorage.getItem("til_adminsGroupId");
til_adminsIds = til_adminsIds || sessionStorage.getItem("til_adminsIds");
redirect_url = redirect_url || sessionStorage.getItem("redirect_url");

// Setting the values in sessionStorage if they are provided
if (gc_region) sessionStorage.setItem("gc_region", gc_region);
if (gc_client) sessionStorage.setItem("gc_client", gc_client);
if (gc_datatable) sessionStorage.setItem("gc_datatable", gc_datatable);
if (til_adminsGroupId)
  sessionStorage.setItem("til_adminsGroupId", til_adminsGroupId);
if (til_adminsIds) sessionStorage.setItem("til_adminsIds", til_adminsIds);
if (redirect_url) sessionStorage.setItem("redirect_url", redirect_url);

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
    await startSession();
    console.log("[TIL] Session started");
    runApp();
  } catch (err) {
    console.log("[TIL] Error: ", err);
  }
}

export { architectApi, conversationsApi, staApi, usersApi };

async function runApp() {
  console.log("[TIL] Application started");

  // Enable event listeners
  async function enableEventListeners() {
    // Select all buttons with the name 'add-to-library'
    const addButtons = document.querySelectorAll(
      'gux-button[name="add-to-library"]'
    );

    // Iterate over the NodeList and add event listeners
    addButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        let library;
        let inputValue;

        if (button.id === "add-to-good-btn") {
          library = "good";
          inputValue = document.querySelector(
            '#add-to-good-div input[slot="input"]'
          ).value;
        } else if (button.id === "add-to-bad-btn") {
          library = "bad";
          inputValue = document.querySelector(
            '#add-to-bad-div input[slot="input"]'
          ).value;
        }

        // Validate the input value for GUID syntax
        const guidPattern =
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!guidPattern.test(inputValue)) {
          alert("Please enter a valid GUID.");
          return;
        }

        handleAddToLibraryClick(library, inputValue);
      });
    });
  }

  const isAdmin = applicationConfig.mode.isAdmin;

  if (isAdmin) {
    // Find all elements with the 'admin-hidden' class
    const adminHiddenElements = document.querySelectorAll(".admin-hidden");

    // Update each element to replace 'admin-hidden' with 'admin-visible'
    adminHiddenElements.forEach((element) => {
      element.classList.remove("admin-hidden");
      element.classList.add("admin-visible");
    });

    await enableEventListeners();
    console.log("[TIL] Admin features enabled");
  } else {
    console.log("[TIL] User is not admin");
  }
}
