// sessionHandler.js
import { applicationConfig } from "./configHandler.js";
import { uapi } from "../app.js";

const testMode = applicationConfig.testMode;
("use strict");

export async function startSession() {
  console.log("{am} Starting session");
  let appUser = null;

  if (testMode) {
    appUser = "Test User";
  } else {
    try {
      // GET Current UserId
      let user = await uapi.getUsersMe({});
      console.log("{am} User details returned", user);
      appUser = user.name;
    } catch (error) {
      console.error("{am} Error getting user details. ", error);
      throw error;
    }
  }
  document.getElementById("content").innerText = "Welcome, " + appUser + "!";
}
