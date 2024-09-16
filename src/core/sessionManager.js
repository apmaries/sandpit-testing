// sessionHandler.js
// Description: Module for handling session-related logic

import { applicationConfig } from "./configManager.js";
import { uApi } from "../app.js";

const testMode = applicationConfig.testMode;
("use strict");

export async function startSession() {
  console.log("[TIL] Starting session");
  let appUser = null;

  if (testMode) {
    appUser = "Test User";
  } else {
    try {
      // GET Current UserId
      let user = await uapi.getUsersMe({});
      console.log("[TIL] User details returned", user);
      appUser = user.name;
    } catch (error) {
      console.error("[TIL] Error getting user details. ", error);
      throw error;
    }
  }
  document.getElementById("welcome-div").innerText =
    "Welcome, " + appUser + "!";
}
