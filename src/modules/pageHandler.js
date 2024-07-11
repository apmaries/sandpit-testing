// pageHandler.js
// Description: Module for handling page navigation and populating page content

// API instances
import { oapi, wapi } from "../app.js";
import { t_oapi, t_wapi } from "../core/testManager.js";

// Shared state modules
import { applicationConfig } from "../core/configManager.js";
import { applicationState } from "../core/stateManager.js";

// App modules
import { generateForecast } from "./forecastHandler.js";

// Utility modules
import {
  populateDropdown,
  hideLoadingSpinner,
  resetLoadingSpinner,
  cleanTable,
} from "../utils/domUtils.js";
import { addEvent, removeEventListeners } from "../utils/eventUtils.js";
import {
  getForecastParameters,
  getOptions,
  getPlanningGroupContacts,
} from "../utils/inputUtils.js";

// Global variables
("use strict");
const testMode = applicationConfig.testMode;

// Function to load page one
export async function loadPageOne() {
  console.log("[OFG] Loading page one");

  // Clean up any existing data
  cleanTable(document.querySelector("#planning-groups-table tbody"));
  applicationState.userInputs.planningGroups = [];
  resetLoadingSpinner("planning-groups-container", "planning-groups-loading");
  document.getElementById("inbound-forecast-div").style.display = "none";
  applicationConfig.inbound.inboundMode = false;

  console.debug("[OFG] Application state at page one load", applicationState);
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
      console.error("[OFG] Error getting business units!", error);
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
      console.error("[OFG] Error getting business unit settings!", error);
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
  addEvent(document.getElementById("p1-next-button"), "click", async () => {
    await loadPageTwo();

    removeEventListeners(businessUnitListbox, "change");
    removeEventListeners(document.getElementById("p1-next-button"), "click");
  });

  // Hide loading spinner and show main
  await hideLoadingSpinner("main", "main-loading-section");
}

// Function to load page two
export async function loadPageTwo() {
  console.log("[OFG] Loading page two");

  console.debug("[OFG] Application state at page two load", applicationState);
  const planningGroupsTableBody = document.querySelector(
    "#planning-groups-table tbody"
  );

  // Function to create a table cell
  function createCell(textContent, dataId, dataValue) {
    const cell = document.createElement("td");
    cell.textContent = textContent;
    if (dataId) {
      cell.dataset[dataId] = dataValue;
    }
    return cell;
  }

  // Function to create a number input
  function createNumberInput(groupId, groupName, matchingCampaign) {
    const guxFormFieldNumber = document.createElement("gux-form-field-number");
    guxFormFieldNumber.setAttribute("label-position", "screenreader");

    const input = document.createElement("input");
    input.slot = "input";
    input.type = "number";
    input.id = "nContacts_" + groupId;
    input.min = "0";
    input.max = "100000";
    input.value = "0";
    input.step = "500";

    const label = document.createElement("label");
    label.slot = "label";
    label.textContent = groupName + " number of contacts";

    if (!matchingCampaign) {
      input.disabled = true;
    }

    guxFormFieldNumber.appendChild(input);
    guxFormFieldNumber.appendChild(label);

    return guxFormFieldNumber;
  }

  // Function to append rows to the table body
  function appendRowsToTable(groups, isMatched) {
    console.log(
      `[OFG] Appending ${isMatched ? "matched" : "unmatched"} rows to table`
    );
    groups.forEach((group) => {
      console.debug(`[OFG] Appending row for ${group.planningGroup.name}`);
      const row = document.createElement("tr");

      // Planning Group column: Display planningGroup.name and optionally campaign.name
      const planningGroupCell = createCell(
        group.planningGroup.name,
        "pgId",
        group.planningGroup.id
      );
      if (isMatched) {
        const campaignNameSpan = document.createElement("span");
        campaignNameSpan.textContent = ` [${group.campaign.name}]`;
        campaignNameSpan.className = "italic-gray";
        planningGroupCell.appendChild(document.createElement("br"));
        planningGroupCell.appendChild(campaignNameSpan);
      } else {
        planningGroupCell.classList.add("grey-italic");
      }
      row.appendChild(planningGroupCell);

      // # Contacts column: Use createNumberInput function, disable if not matched
      const contactsCell = document.createElement("td");
      const numberInput = createNumberInput(
        group.groupId,
        group.groupName,
        isMatched
      );
      contactsCell.appendChild(numberInput);
      row.appendChild(contactsCell);

      // Append the row to the table body
      planningGroupsTableBody.appendChild(row);
    });
  }

  // Get list of planning groups
  async function getPlanningGroups() {
    try {
      const planningGroups = testMode
        ? await t_wapi.getPlanningGroups()
        : await wapi.getWorkforcemanagementBusinessunitPlanninggroups(
            applicationState.userInputs.businessUnit.id
          );
      console.log(
        `[OFG] Loaded ${planningGroups.entities.length} Planning groups`,
        planningGroups.entities
      );

      return planningGroups.entities; // Return the list of planning groups
    } catch (error) {
      console.error("[OFG] Error getting planning groups!", error);
      throw error;
    }
  }

  // Get list of campaigns
  async function getCampaigns() {
    try {
      const campaigns = testMode
        ? await t_oapi.getOutboundCampaigns()
        : await oapi.getOutboundCampaigns();
      console.log(
        `[OFG] Loaded ${campaigns.entities.length} campaigns`,
        campaigns.entities
      );
      return campaigns.entities; // Return the list of campaigns
    } catch (error) {
      console.error("[OFG] Error getting campaigns!", error);
      throw error;
    }
  }

  // Function to match campaigns to planning groups by associated queue id
  async function queueCampaignMatcher(planningGroups, campaigns) {
    console.log("[OFG] Matching campaigns to planning groups");

    // Array to hold groups
    const matchedGroups = [];
    const unmatchedGroups = [];
    console.log("matchedGroups", matchedGroups);

    // Loop through planning groups and campaigns to match them
    planningGroups.forEach((pg) => {
      const pgName = pg.name;
      const pgQueueId = pg.routePaths[0].queue.id;

      // Object to hold group info
      let group = {
        planningGroup: {
          name: pgName,
          id: pg.id,
        },
        campaign: {
          name: "",
          id: "",
        },
        queue: {
          name: "",
          id: "",
        },
      };

      const matchedCampaign = campaigns.find((c) => c.queue.id === pgQueueId);

      if (matchedCampaign) {
        pg.campaign = matchedCampaign;
        console.log(
          `[OFG] [${pgName}] Matched campaign ${matchedCampaign.name} (${matchedCampaign.id})`
        );
        group.campaign.name = matchedCampaign.name;
        group.campaign.id = matchedCampaign.id;
        group.queue.name = matchedCampaign.queue.name;
        group.queue.id = matchedCampaign.queue.id;
        matchedGroups.push(group);
      } else {
        console.warn(`[OFG] [${pgName}] No matching campaign found`);
        unmatchedGroups.push(group);
      }

      // Add group to application state
      applicationState.userInputs.planningGroups.push(group);
    });

    // Enable inboundMode if any planning group are not matched
    if (unmatchedGroups.length > 0) {
      applicationConfig.inbound.inboundMode = true;
      document.getElementById("inbound-forecast-div").style.display = "block";
      console.log("[OFG] Inbound mode enabled");
    }

    console.debug(
      "[OFG] Application state after matching campaigns to planning groups",
      applicationState
    );

    return [matchedGroups, unmatchedGroups];
  }

  // Main logic for loading page two
  const [planningGroups, campaigns] = await Promise.all([
    getPlanningGroups(),
    getCampaigns(),
  ]);

  const [matchedGroups, unmatchedGroups] = await queueCampaignMatcher(
    planningGroups,
    campaigns
  );

  // Append matched and unmatched groups to the table
  appendRowsToTable(matchedGroups, true);
  appendRowsToTable(unmatchedGroups, false);

  // Add event listener to generate button
  addEvent(document.getElementById("generate-button"), "click", async () => {
    await getPlanningGroupContacts();

    // Assign applicationState.userInputs variables
    Object.assign(
      applicationState.userInputs.forecastParameters,
      getForecastParameters()
    );
    Object.assign(applicationState.userInputs.forecastOptions, getOptions());
    await generateForecast();
    await loadPageThree();

    removeEventListeners(document.getElementById("generate-button"), "click");
    removeEventListeners(document.getElementById("p2-back-button"), "click");
  });

  // Add event listener for back button
  addEvent(document.getElementById("p2-back-button"), "click", async () => {
    await loadPageOne();

    removeEventListeners(document.getElementById("generate-button"), "click");
    removeEventListeners(document.getElementById("p2-back-button"), "click");
  });

  // Hide loading spinner and show planning groups table
  await hideLoadingSpinner(
    "planning-groups-container",
    "planning-groups-loading"
  );
}

// Function to load page three
export async function loadPageThree() {
  console.log("[OFG] Loading page three");

  console.debug("[OFG] Application state at page three load", applicationState);

  // Initialize the forecast outputs
  const forecastData = applicationState.forecastOutputs.generatedForecast;
  applicationState.forecastOutputs.modifiedForecast = JSON.parse(
    JSON.stringify(forecastData)
  );

  // Get the planning groups from sharedState
  console.log("[OFG] Getting planning groups from sharedState");
  const planningGroupsSummary = forecastData.map((pg) => {
    return {
      id: pg.planningGroup.id,
      name: pg.planningGroup.name,
    };
  });

  // Populate page three listboxes
  console.log(
    "[OFG] Populating page three listboxes",
    planningGroupsSummary,
    applicationConfig.daysOfWeek
  );
  populateDropdown(
    document.getElementById("business-unit-listbox"),
    planningGroupsSummary,
    "name",
    true
  );
  populateDropdown(
    document.getElementById("week-day-listbox"),
    applicationConfig.daysOfWeek,
    "name",
    false
  );

  // Add event listener for Planning Group dropdown
  const planningGroupDropdown = document.getElementById(
    "planning-group-dropdown"
  );
  planningGroupDropdown.removeAttribute("disabled");
  addEvent(planningGroupDropdown, "change", async () => {});

  // Add event listener for weekday dropdown
  const weekDayDropdown = document.getElementById("week-day-dropdown");
  weekDayDropdown.removeAttribute("disabled");
  addEvent(weekDayDropdown, "change", async () => {});

  // Add event listener for import button
  console.log("[OFG] Adding event listener for Import button");
  addEvent(document.getElementById("import-button"), "click", async () => {
    await importForecast();
  });

  // Add event listener for back button
  console.log("[OFG] Adding event listener for Back button");
  addEvent(document.getElementById("p3-back-button"), "click", () => {
    loadPageTwo();
  });

  // Hide loading spinner and show page three
  console.log("[OFG] Hiding loading spinner and showing page three");
  await hideLoadingSpinner(
    "forecast-outputs-container",
    "generate-loading-div"
  );
}
