// sessionHandler.js
// Description: Module for handling session-related logic

import { applicationConfig } from "./configManager.js";
import { uapi } from "../app.js";

const testMode = applicationConfig.testMode;
("use strict");

export async function startSession() {
  console.log("[OFG] Starting session");
  let appUser = null;

  if (testMode) {
    appUser = "Test User";
  } else {
    try {
      // GET Current UserId
      let user = await uapi.getUsersMe({});
      console.log("[OFG] User details returned", user);
      appUser = user.name;
    } catch (error) {
      console.error("[OFG] Error getting user details. ", error);
      throw error;
    }
  }
  document.getElementById("user-welcome").innerText =
    "Welcome, " + appUser + "!";
}
