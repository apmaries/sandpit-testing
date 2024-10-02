// domUtils.js
// Description: Utility for updating the DOM

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules

// Utility modules

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Utility function to create the table
export function makeDomTables() {
  // Extract the columns from the parameters object
  const columns = Object.entries(
    applicationConfig.datatable.parameters
  ).flatMap(([groupName, groupColumns]) =>
    Object.values(groupColumns).map((column) => ({
      ...column,
      groupName,
    }))
  );

  // Filter out the columns where hidden is true
  const visibleColumns = columns.filter((column) => !column.hidden);

  // Sort the columns based on displayOrder
  visibleColumns.sort((a, b) => a.displayOrder - b.displayOrder);

  // Select all parent div elements that have the data-table-id attribute
  const parentDivs = document.querySelectorAll("div[data-table-id]");

  parentDivs.forEach((parentDiv) => {
    // Get the table element inside the parent div
    const table = parentDiv.querySelector('table[slot="data"] thead tr');
    if (table) {
      table.innerHTML = ""; // Clear existing headers

      // Create the table headers dynamically
      visibleColumns.forEach((column) => {
        const th = document.createElement("th");
        th.setAttribute(
          "data-column-name",
          column.name.toLowerCase().replace(/\s+/g, "-")
        );
        th.setAttribute("data-group-name", column.groupName);
        th.textContent = column.name;

        // Apply hidden-column class to all groups except "conversation" and "key"
        if (column.groupName !== "conversation" && column.groupName !== "key") {
          th.classList.add("hidden-column");
        }

        table.appendChild(th);
      });

      // Apply hidden-column class to corresponding td elements in each row
      const tbody = parentDiv.querySelector('table[slot="data"] tbody');
      if (tbody) {
        const trElements = tbody.querySelectorAll("tr");
        trElements.forEach((tr) => {
          visibleColumns.forEach((column, index) => {
            const td = tr.children[index];
            if (td && column.groupName !== "conversation") {
              td.classList.add("hidden-column");
            }
          });
        });
      }
    }
  });
}

// Utility function to hide table columns by group
export function hideTableColumn(tableId, groupName) {
  const table = document.querySelector(`#${tableId} table[slot="data"]`);
  if (!table) return;

  // Find the indices of the columns to hide
  const thElements = table.querySelectorAll("thead th");
  const columnIndices = [];
  thElements.forEach((th, index) => {
    if (th.getAttribute("data-group-name") === groupName) {
      columnIndices.push(index);
      th.classList.add("hidden-column");
    }
  });

  if (columnIndices.length === 0) return;

  // Hide the corresponding td elements in each row
  const trElements = table.querySelectorAll("tbody tr");
  trElements.forEach((tr) => {
    columnIndices.forEach((columnIndex) => {
      const td = tr.children[columnIndex];
      if (td) {
        td.classList.add("hidden-column");
      }
    });
  });
}

// Utility function to show table columns by group
export function showTableColumn(tableId, groupName) {
  const table = document.querySelector(`#${tableId} table[slot="data"]`);
  if (!table) return;

  // Find the indices of the columns to show
  const thElements = table.querySelectorAll("thead th");
  const columnIndices = [];
  thElements.forEach((th, index) => {
    if (th.getAttribute("data-group-name") === groupName) {
      columnIndices.push(index);
      th.classList.remove("hidden-column");
    }
  });

  if (columnIndices.length === 0) return;

  // Show the corresponding td elements in each row
  const trElements = table.querySelectorAll("tbody tr");
  trElements.forEach((tr) => {
    columnIndices.forEach((columnIndex) => {
      const td = tr.children[columnIndex];
      if (td) {
        td.classList.remove("hidden-column");
      }
    });
  });
}

// Utility function to reset checkboxes
export function resetCheckboxes() {
  const checkboxes = document.querySelectorAll(
    'input[name="column-group-checkbox"]'
  );

  // Uncheck each checkbox except for "Conversation" group
  checkboxes.forEach((checkbox) => {
    if (checkbox.value !== "conversation") {
      checkbox.checked = false;
    }
  });
}

// Utility function to populate the table with data
export function populateDomTable(t, r, c) {
  let table = document.getElementById(t);
  let tbody = table.getElementsByTagName("tbody")[0];

  if (c) {
    // Clear the table
    tbody.innerHTML = "";
  }

  // Get the state of the checkboxes
  const checkboxes = document.querySelectorAll(
    'input[name="column-group-checkbox"]'
  );

  r.forEach((row) => {
    let tr = document.createElement("tr");

    // Iterate over the datatable columns from the configuration
    Object.keys(applicationConfig.datatable.parameters).forEach(
      (parameterGroup) => {
        Object.keys(
          applicationConfig.datatable.parameters[parameterGroup]
        ).forEach((parameterKey) => {
          const parameter =
            applicationConfig.datatable.parameters[parameterGroup][
              parameterKey
            ];

          const keyFormat = parameter.format;
          //console.log(`[TIL] Key '${parameterKey}' format: ${keyFormat}`);

          // Always display the "key" column
          if (parameterKey === "key") {
            let td = document.createElement("td");
            td.setAttribute("data-group-name", parameterGroup);
            td.setAttribute("data-column-name", parameterKey);

            let region = sessionStorage.getItem("gc_region");
            let a = document.createElement("a");
            a.href = `https://apps.${region}/directory/#/analytics/interactions/${row.key}/admin/details`;
            a.target = "_blank";
            a.appendChild(document.createTextNode(row[parameterKey] || ""));
            td.appendChild(a);

            tr.appendChild(td);
          } else if (
            parameterKey === "library_type" ||
            parameterKey === "division_ids" ||
            parameterKey === "queue_ids"
          ) {
            // Skip these columns
            return;
          } else {
            // Find the corresponding checkbox for the parameterGroup
            const checkbox = Array.from(checkboxes).find(
              (cb) => cb.value === parameterGroup
            );

            // Create a td element for the column
            let td = document.createElement("td");
            td.setAttribute("data-group-name", parameterGroup);
            td.setAttribute("data-column-name", parameterKey);

            // Set the text content of the td element
            let columnValue = String(row[parameterKey]);

            // Format the column value based on the format type
            if (keyFormat === "date" && columnValue !== "-") {
              columnValue = new Date(columnValue).toLocaleDateString();
            } else if (keyFormat === "datetime" && columnValue !== "-") {
              columnValue = new Date(columnValue).toLocaleString();
            } else if (keyFormat === "seconds" && columnValue !== "-") {
              columnValue = (columnValue / 1000).toFixed(1) + "s";
            } else if (keyFormat === "percentage" && columnValue !== "-") {
              columnValue =
                columnValue > 1
                  ? (columnValue * 1).toFixed(1) + "%"
                  : (columnValue * 100).toFixed(1) + "%";
            }

            // Format the column value based on the column name
            if (parameterKey === "sentiment_trend_class") {
              // Add a space between capital letters
              columnValue = columnValue.replace(/([A-Z])/g, " $1").trim();
            }

            td.appendChild(document.createTextNode(columnValue || "!"));
            if (checkbox && !checkbox.checked) {
              td.classList.add("hidden-column");
            }

            tr.appendChild(td);
          }
        });
      }
    );

    tbody.appendChild(tr);
  });
  console.log(`[TIL] Table ${t} populated with ${r.length} rows`);
}

// Utility function to remove a table row
export function removeDomTableRow(tableId, rowId) {
  let table = document.getElementById(tableId);
  let tbody = table.getElementsByTagName("tbody")[0];
  let rows = tbody.getElementsByTagName("tr");

  for (let row of rows) {
    let cells = row.getElementsByTagName("td");
    for (let cell of cells) {
      if (
        cell.getAttribute("data-column-name") === "key" &&
        cell.textContent === rowId
      ) {
        tbody.removeChild(row);
        return;
      }
    }
  }
}

// Utility function to update a table row
export function updateDomTableRow(tableId, row) {
  let table = document.getElementById(tableId);
  let tbody = table.getElementsByTagName("tbody")[0];
  let rows = tbody.getElementsByTagName("tr");
}

// Function to update management tools response
export function updateManagementToolsResponse(
  ele,
  response,
  responseClass = null
) {
  let responseDiv = ele;
  responseDiv.innerHTML = ""; // Clear existing content

  // Create a span for the response text
  let responseText = document.createElement("span");
  responseText.classList.add("response-text");
  responseText.innerText = response;
  responseDiv.appendChild(responseText);

  // Helper function to create an SVG element
  function createSVG(pathData) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "responsive-svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");

    let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);

    svg.appendChild(path);
    return svg;
  }

  // Add the success or error class based on the responseClass
  if (responseClass === null) {
    responseDiv.classList.remove("success-response", "error-response");
    responseDiv.classList.add("info-response");

    // Info SVG path data
    const infoPathData =
      "M 8 16 C 10.1217 16 12.1566 15.1571 13.6569 13.6569 C 15.1571 12.1566 16 10.1217 16 8 C 16 5.87827 15.1571 3.84344 13.6569 2.34315 C 12.1566 0.842855 10.1217 0 8 0 C 5.87827 0 3.84344 0.842855 2.34315 2.34315 C 0.842855 3.84344 0 5.87827 0 8 C 0 10.1217 0.842855 12.1566 2.34315 13.6569 C 3.84344 15.1571 5.87827 16 8 16 Z M 6.75 10.5 H 7.5 V 8.5 H 6.75 C 6.33437 8.5 6 8.16562 6 7.75 C 6 7.33437 6.33437 7 6.75 7 H 8.25 C 8.66562 7 9 7.33437 9 7.75 V 10.5 H 9.25 C 9.66562 10.5 10 10.8344 10 11.25 C 10 11.6656 9.66562 12 9.25 12 H 6.75 C 6.33437 12 6 11.6656 6 11.25 C 6 10.8344 6.33437 10.5 6.75 10.5 Z M 8 4 C 8.26522 4 8.51957 4.10536 8.70711 4.29289 C 8.89464 4.48043 9 4.73478 9 5 C 9 5.26522 8.89464 5.51957 8.70711 5.70711 C 8.51957 5.89464 8.26522 6 8 6 C 7.73478 6 7.48043 5.89464 7.29289 5.70711 C 7.10536 5.51957 7 5.26522 7 5 C 7 4.73478 7.10536 4.48043 7.29289 4.29289 C 7.48043 4.10536 7.73478 4 8 4 Z";

    // Append the info SVG to the responseDiv
    responseDiv.appendChild(createSVG(infoPathData));
  } else if (responseClass) {
    responseDiv.classList.remove("info-response", "error-response");
    responseDiv.classList.add("success-response");

    // Success SVG path data
    const successPathData =
      "M8 16C12.4187 16 16 12.4187 16 8C16 3.58125 12.4187 0 8 0C3.58125 0 0 3.58125 0 8C0 12.4187 3.58125 16 8 16ZM11.5312 6.53125L7.53125 10.5312C7.2375 10.825 6.7625 10.825 6.47188 10.5312L4.47188 8.53125C4.17813 8.2375 4.17813 7.7625 4.47188 7.47188C4.76563 7.18125 5.24062 7.17813 5.53125 7.47188L7 8.94063L10.4688 5.46875C10.7625 5.175 11.2375 5.175 11.5281 5.46875C11.8187 5.7625 11.8219 6.2375 11.5281 6.52812L11.5312 6.53125Z";

    // Append the success SVG to the responseDiv
    responseDiv.appendChild(createSVG(successPathData));
  } else {
    responseDiv.classList.remove("info-response", "success-response");
    responseDiv.classList.add("error-response");

    // Error SVG path data
    const errorPathData =
      "M0.311375 9.1205C-0.103792 8.42641 -0.103792 7.57359 0.311375 6.8795L3.15317 2.1205C3.56834 1.42641 4.33109 1 5.16142 1H10.8418C11.6689 1 12.4349 1.42641 12.85 2.1205L15.6886 6.8795C16.1038 7.57359 16.1038 8.42641 15.6886 9.1205L12.8468 13.8795C12.4317 14.5736 11.6689 15 10.8386 15H5.1582C4.33109 15 3.56512 14.5736 3.14995 13.8795L0.311375 9.1205ZM8 4.01601C7.57196 4.01601 7.2276 4.34904 7.2276 4.76301V8.249C7.2276 8.66296 7.57196 8.996 8 8.996C8.42804 8.996 8.7724 8.66296 8.7724 8.249V4.76301C8.7724 4.34904 8.42804 4.01601 8 4.01601ZM9.02987 10.988C9.02987 10.4371 8.56965 9.992 8 9.992C7.43035 9.992 6.97013 10.4371 6.97013 10.988C6.97013 11.5389 7.43035 11.984 8 11.984C8.56965 11.984 9.02987 11.5389 9.02987 10.988Z";

    // Append the error SVG to the responseDiv
    responseDiv.appendChild(createSVG(errorPathData));
  }
}
