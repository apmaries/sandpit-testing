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

// Get user
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

  try {
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
  } catch (error) {
    console.error("[TIL] Error checking if user is admin", error);
  }

  await getPermittedDivisions();
  return user;
}

// Get permitted divisions
async function getPermittedDivisions() {
  console.log("[TIL] Getting permitted divisions");
  let divisions = [];

  let permission = "analytics:conversationdetail:view";
  let opts = {
    "pageNumber": 1, // Number | Page number
    "pageSize": 500, // Number | Page size
  };

  try {
    if (testMode) {
      // Get divisions using test API
      let t_response =
        await t_usersApi.getAuthorizationDivisionspermittedPagedMe();
      divisions = t_response.entities;
    } else {
      let response = await usersApi.getAuthorizationDivisionspermittedPagedMe(
        permission,
        opts
      );
      divisions = response.entities;
    }
  } catch (error) {
    throw error;
  }

  console.debug("[TIL] Permitted divisions returned", divisions);

  // Map to save only division id and name to applicationConfig
  applicationConfig.permittedDivisions = divisions.map((division) => ({
    id: division.id,
    name: division.name,
  }));
}
