// users.js
// Description: Utility module to handle users api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { usersApi } from "../app.js";
import { t_usersApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

export async function getUser() {
  console.log("[TIL] Getting user");
  let user;

  let opts = {
    "expand": ["groups"], // [String] | Which fields, if any, to expand.
  };

  try {
    if (testMode) {
      // Get integration using test API
      user = await t_usersApi.getUsersMe();
    } else {
      user = await usersApi.getUsersMe(opts);
    }
  } catch (error) {
    console.error("[TIL] Error getting user", error);
    throw error;
  }

  console.debug("[TIL] User returned", user);

  // Check if user is an admin
  let isAdmin;

  const adminsIds = sessionStorage.getItem("til_adminsIds");
  const adminsGroup = sessionStorage.getItem("til_adminsGroupId");

  if (
    adminsIds.includes(user.id) ||
    user.groups.some((group) => group.id === adminsGroup)
  ) {
    isAdmin = true;
  } else {
    isAdmin = false;
  }
  console.log("[TIL] User is admin: ", isAdmin);
  applicationConfig.mode.isAdmin = isAdmin;

  return user;
}
