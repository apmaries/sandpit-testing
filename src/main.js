// main.js
// Description: Main application module

import { applicationConfig } from "./core/configManager.js";
import { loadPageOne } from "./modules/pageHandler.js";

const testMode = applicationConfig.testMode;
("use strict");

export function runApp() {
  console.log("[OFG] Initializing main app");

  // Add the logic for the rest of your app here.
  loadPageOne();
}
