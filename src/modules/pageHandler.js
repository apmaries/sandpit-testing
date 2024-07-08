// pageHandler.js
// Description: Module for handling page navigation and populating page content

import { applicationConfig } from "../core/configManager.js";
import { applicationState } from "../core/stateManager.js";
import { wapi } from "../app.js";
import { t_wapi } from "../core/testManager.js";

const testMode = applicationConfig.testMode;
("use strict");

export async function loadPageOne() {
  console.log("[OFG] Loading page one");
  console.debug("[OFG] Application state", applicationState);

  if (testMode) {
    console.log("[OFG] t_wapi", t_wapi);
  } else {
    console.log("[OFG] wapi", wapi);
  }
}
