// app.js
// Description: The main entry point file that initializes the app and starts the main logic.

import { applicationConfig } from "./core/configManager.js";
import { runApp } from "./main.js";
import { startSession } from "./core/sessionManager.js";

const testMode = applicationConfig.testMode;
("use strict");

let platformClient = require("platformClient");

let url = new URL(document.location.href);
let gc_region = url.searchParams.get("gc_region");
let gc_clientId = url.searchParams.get("gc_clientId");
let gc_redirectUrl = url.searchParams.get("gc_redirectUrl");

//Getting and setting the GC details from dynamic URL and session storage
gc_region
  ? sessionStorage.setItem("gc_region", gc_region)
  : (gc_region = sessionStorage.getItem("gc_region"));
gc_clientId
  ? sessionStorage.setItem("gc_clientId", gc_clientId)
  : (gc_clientId = sessionStorage.getItem("gc_clientId"));
gc_redirectUrl
  ? sessionStorage.setItem("gc_redirectUrl", gc_redirectUrl)
  : (gc_redirectUrl = sessionStorage.getItem("gc_redirectUrl"));

const client = platformClient.ApiClient.instance;
const capi = new platformClient.ConversationsApi();
const napi = new platformClient.NotificationsApi();
const tapi = new platformClient.TokensApi();
const uapi = new platformClient.UsersApi();
const wapi = new platformClient.WorkforceManagementApi();

export async function startApp() {
  console.log("{am} Starting application");

  if (testMode) {
    console.log("%c{am} Test mode enabled", "color: red");
  } else {
    try {
      client.setEnvironment(gc_region);
      client.setPersistSettings(true, "_am_");

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

      console.log("%c{am} Logging in to Genesys Cloud", "color: green");
      await client.loginImplicitGrant(gc_clientId, gc_redirectUrl, {});
    } catch (err) {
      console.log("{am} Error: ", err);
    }
  }
  //Enter in starting code.
  await startSession();
  runApp();
}

export { capi, napi, tapi, uapi, wapi };
