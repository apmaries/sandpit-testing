// userInputs.js
// Description: Module for getting user inputs

// Function to get the number of contacts for each planning group
export async function getPlanningGroupContacts() {
  // Define shared state planning groups
  let planningGroups = sharedState.userInputs.planningGroups;

  // Get and validate user planning group values
  const tableBody = document.querySelector("#planning-groups-table tbody");
  const rows = tableBody.querySelectorAll("tr");

  let totalContacts = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const pgNameCell = row.querySelector("td:first-child");
    const pgName = pgNameCell.textContent;
    const pgId = pgNameCell.dataset.pgId;

    // Find the planning group in the sharedState.planningGroups array
    let pgData = planningGroups.find(
      (pgData) => pgData.planningGroup.id === pgId
    );

    // Get the number of contacts
    const numContactsInput = row.querySelector("input");
    const numContacts = numContactsInput.value;

    // Validate the number of contacts
    if (numContacts === "" || isNaN(numContacts)) {
      alert(`Please enter a valid number of contacts for ${pgName}`);
      return;
    }

    // Add numContacts to totalContacts
    totalContacts += parseInt(numContacts);

    // Add numContacts to matched planning group
    pgData.numContacts = numContacts;
  }

  return totalContacts;
}

// Function to get forecast parameters
export function getForecastParameters() {
  return {
    weekStart: document.getElementById("week-start").value,
    historicalWeeks: document.getElementById("historical-weeks").value,
    description: document.getElementById("fc-description").value,
  };
}

// Function to get options
export function getOptions() {
  return {
    ignoreZeroes: document.getElementById("ignore-zeroes").checked,
    //resolveContactsAhtMode: document.getElementById("resolve-contacts-aht").checked,
    generateInbound: document.getElementById("generate-inbound-fc").checked,
    retainInbound: document.getElementById("retain-inbound-fc").checked,
  };
}