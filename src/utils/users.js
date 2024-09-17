// users.js
// Description: Utility module to handle users api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { usersApi } from "../app.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.testMode;

export async function getUser() {
  console.log("[TIL] Getting user");
  let user = {};

  if (testMode) {
    // Return test user
    user = "Test User";
    return user;
  }

  try {
    let response = await usersApi.getUsersMe();
    user = response;
    console.log("[TIL] User returned", user);
  } catch (error) {
    console.error("[TIL] Error getting user. ", error);
    throw error;
  }

  return user;
}
