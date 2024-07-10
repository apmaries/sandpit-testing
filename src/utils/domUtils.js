// domUtils.js
// Description: Utility functions for DOM manipulation

export function getRadioValue(ele) {
  for (let i = 0; i < ele.length; i++) {
    if (ele[i].checked) {
      return ele[i].value;
    }
  }
}

// Function to hide loading spinner and show content
export async function hideLoadingSpinner(elem, spinner) {
  const elemElem = document.getElementById(elem);
  const spinnerElem = document.getElementById(spinner);

  elemElem.style.display = "block";
  spinnerElem.style.display = "none";
}

// Function to hide loading spinner and show content
export async function resetLoadingSpinner(elem, spinner) {
  const elemElem = document.getElementById(elem);
  const spinnerElem = document.getElementById(spinner);

  elemElem.style.display = "none";
  spinnerElem.style.display = "block";
}

// Function to replace the text in loading message
export async function updateLoadingMessage(elem, message) {
  const loadingMessage = document.getElementById(elem);
  loadingMessage.innerHTML = message;
}

// Function to populate dropdowns with provided data
export function populateDropdown(
  listbox,
  data,
  sortAttribute = "name",
  applySort = true
) {
  // Remove existing listbox items
  while (listbox.firstChild) {
    listbox.removeChild(listbox.firstChild);
  }

  return new Promise((resolve, reject) => {
    try {
      if (data.length === 0) {
        listbox.innerHTML = '<gux-option value="">No data found</gux-option>';
        resolve();
        return;
      }

      // Check if sorting should be applied
      if (applySort) {
        if (typeof data[0] === "object" && sortAttribute) {
          // sort data by sortAttribute (not case sensitive)
          data.sort((a, b) =>
            a[sortAttribute].localeCompare(b[sortAttribute], undefined, {
              sensitivity: "base",
            })
          );
        } else if (typeof data[0] === "string") {
          // sort data
          data.sort();
        }
      }

      listbox.innerHTML = "";
      data.forEach((item) => {
        const option = document.createElement("gux-option");
        option.value = item.id || item;
        option.dataset.name = item.name || item;
        option.dataset.id = item.id || item;
        option.innerHTML = item.name || item;
        listbox.appendChild(option);
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Function to handle page transitions
export async function switchPages(hidePageId, showPageId) {
  const hidePage = document.getElementById(hidePageId);
  const showPage = document.getElementById(showPageId);

  if (hidePage) {
    hidePage.classList.add("inactive-page");
    hidePage.classList.remove("active-page");
  }

  if (showPage) {
    showPage.classList.remove("inactive-page");
    showPage.classList.add("active-page");
  }
}

// Function to validate planning group dropdown entries
export async function validatePlanningGroupDropdown() {
  console.log("[OFG] Validating Planning Group dropdown entries");
  const planningGroupsDropdown = document.getElementById(
    "planning-group-dropdown"
  );

  // Get list of planning groups in listbox
  const planningGroups = planningGroupsListbox.querySelectorAll("gux-option");

  // Convert planningGroups to an array and iterate over it
  Array.from(planningGroups).forEach((option) => {
    const optionId = option.value;

    // Find the planning group in sharedState.generatedForecast
    const completedFcPg = sharedState.generatedForecast.find(
      (pgForecast) => pgForecast.planningGroup.id === optionId
    );
    const pgName = completedFcPg.planningGroup.name;

    if (completedFcPg.metadata.forecastStatus.isForecast === false) {
      const reason = completedFcPg.metadata.forecastStatus.reason;
      console.warn(
        `[OFG] [${pgName}] Disabling dropdown option with reason: `,
        reason
      );

      // Set the option to disabled
      option.setAttribute("disabled", "true");

      // Update the option text
      let optionText = option.textContent;
      option.textContent = `${optionText} - ${reason}`;
    } else {
      option.removeAttribute("disabled");
    }
  });
  planningGroupsDropdown.removeAttribute("disabled");
}

// Function to delete table rows from a given table	body element
export async function cleanTable(tableBody) {
  // Remove existing table rows
  while (tableBody.firstChild) {
    tableBody.removeChild(tableBody.firstChild);
  }
}
