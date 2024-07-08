// pageHandler.js
// Description: Module for handling page navigation and populating page content

import { applicationConfig } from "../core/configManager.js";
import { applicationState } from "../core/stateManager.js";
import { wapi } from "../app.js";
import { t_wapi } from "../core/testManager.js";
import { populateDropdown, hideLoadingSpinner } from "../utils/domUtils.js";
import { addEvent, removeEventListeners } from "../utils/eventUtils.js";

const testMode = applicationConfig.testMode;
("use strict");

export async function loadPageOne() {
  console.log("[OFG] Loading page one");
  console.debug("[OFG] Application state", applicationState);
  const businessUnitListbox = document.getElementById("business-unit-listbox");

  // Get list of business units
  async function getBusinessUnits() {
    try {
      const businessUnits = testMode
        ? await t_wapi.getBusinessUnits()
        : await wapi.getWorkforcemanagementBusinessunits();
      console.log(
        `[OFG] Loaded ${businessUnits.entities.length} Business units`,
        businessUnits.entities
      );

      return businessUnits.entities; // Return the list of business units
    } catch (error) {
      console.error("[OFG] Error getting business units. ", error);
      throw error;
    }
  }

  // Get selected business unit settings
  async function getBusinessUnitSettings(businessUnitId) {
    console.log("[OFG] Getting settings for business unit", businessUnitId);
    let opts = {
      "expand": ["settings.timeZone", "settings.startDayOfWeek"], // [String] | Include to access additional data on the business unit
    };
    try {
      const businessUnit = testMode
        ? await t_wapi.getBusinessUnitData()
        : await wapi.getWorkforcemanagementBusinessunit(businessUnitId, opts);
      console.log(
        `[OFG] Loaded settings for ${businessUnit.name} (${businessUnit.id})`,
        businessUnit
      );

      applicationState.userInputs.businessUnit.name = businessUnit.name;
      applicationState.userInputs.businessUnit.id = businessUnit.id;
      applicationState.userInputs.businessUnit.settings = businessUnit.settings;

      // Populate the business unit settings to UI
      populateBusinessUnitSettings(businessUnit);

      console.debug(
        "[OFG] Application state after business unit selection",
        applicationState
      );
    } catch (error) {
      console.error("[OFG] Error getting business unit settings. ", error);
      throw error;
    }
  }

  function populateBusinessUnitSettings(businessUnit) {
    console.log("[OFG] Populating business unit settings");
    const businessUnitSettings = businessUnit.settings;

    const timeZone = businessUnitSettings.timeZone;
    document.getElementById("bu-timezone").value = timeZone;

    const startDayOfWeek = businessUnitSettings.startDayOfWeek;
    document.getElementById(
      "week-start-label"
    ).textContent = `Week start (${startDayOfWeek})`;
  }

  // Main logic for loading page one
  const businessUnits = await getBusinessUnits();
  await populateDropdown(businessUnitListbox, businessUnits, "name", true);

  // Add event listener for business unit selection
  addEvent(businessUnitListbox, "change", (event) => {
    const selectedValue = event.target.value;
    getBusinessUnitSettings(selectedValue);
  });

  // Add event listener for next button
  // Should also remove event listener from business unit listbox when navigating away

  // Hide loading spinner and show main
  await hideLoadingSpinner("main", "main-loading-section");
}
