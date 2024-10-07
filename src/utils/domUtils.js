// domUtils.js
// Description: Utility for updating the DOM

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api modules

// Utility modules

// Global variables
const testMode = applicationConfig.mode.isTest;
("use strict");

// Helper function to create an SVG element
function createSVG(type) {
  const paths = applicationConfig.svg;
  const pathData = paths[type] || null;

  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "responsive-svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");

  let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);

  svg.appendChild(path);
  return svg;
}

// Helper function to add conversation warning icon
function addConversationIconTooltip(container, alert) {
  let icon = createSVG(alert.type);
  icon.classList.add(`${alert.type}-icon`);

  // Create the gux-tooltip element
  let tooltip = document.createElement("gux-tooltip");
  tooltip.textContent = alert.message;
  tooltip.setAttribute("placement", "right");

  // Append the warning icon to the container
  container.appendChild(icon);

  // Append the tooltip to the container
  container.appendChild(tooltip);
}

// Helper function to populate the table with data
function populateDomTable(t, r, a) {
  return new Promise((resolve, reject) => {
    let table = document.getElementById(t);
    let tbody = table.getElementsByTagName("tbody")[0];
    let rowCount = 0;
    let adminAlerts = [];

    // Clear the table if append mode is false
    if (!a) {
      tbody.innerHTML = "";
    }

    // Get the state of the checkboxes
    const checkboxes = document.querySelectorAll(
      'input[name="column-group-checkbox"]'
    );

    // Build the tags array
    let tags = [];
    r.forEach((row) => {
      if (row.tags) {
        tags = tags.concat(row.tags.split("|||"));
      }
    });
    populateTagsArray(tags);

    r.forEach((row) => {
      let adminAlert;

      // Check if record has been archived or deleted
      if (
        row.file_state &&
        (row.file_state === "ARCHIVED" || row.file_state === "DELETED")
      ) {
        // Skip row if deleted
        if (row.file_state === "DELETED") {
          console.error(
            `[TIL] Recording for ${row.key} has been deleted... skipping row`
          );
          return;
        }

        if (row.file_state === "ARCHIVED") {
          let alert = {
            type: "warning",
            message: "This recording has been archived",
          };
          let conversation = { id: row.key, library: row.library_type };
          adminAlert = { alert, conversation };
          adminAlerts.push(adminAlert);
        }
      }

      let tr = document.createElement("tr");

      // Check if delete_date is within 30 days
      if (row.delete_date && row.delete_date !== "-") {
        let deleteDate = new Date(row.delete_date);
        let currentDate = new Date();
        let diffTime = deleteDate - currentDate;
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= applicationConfig.general.alertDays) {
          let alert = {
            type: "warning",
            message: "This recording will be deleted soon",
          };
          let conversation = { id: row.key, library: row.library_type };
          adminAlert = { alert, conversation };
          adminAlerts.push(adminAlert);
        }
      }

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

            // Always display the "key" column
            if (parameterKey === "key") {
              let td = document.createElement("td");
              td.setAttribute("data-group-name", parameterGroup);
              td.setAttribute("data-column-name", parameterKey);

              // Create a container for the ID and the warning icon
              let container = document.createElement("div");
              container.classList.add("id-warning-container");

              // Create a link to the interaction details page
              let region = sessionStorage.getItem("gc_region");
              let a = document.createElement("a");
              a.href = `https://apps.${region}/directory/#/analytics/interactions/${row.key}/admin/details`;
              a.target = "_blank";
              a.appendChild(document.createTextNode(row[parameterKey] || ""));
              a.classList.add("id-link");

              // Append the link to the container first
              container.appendChild(a);

              // Add a warning icon if delete_date is within 30 days
              if (adminAlert) {
                // Add the warning icon and tooltip
                addConversationIconTooltip(container, adminAlert.alert);
              }

              // Append the container to the td element
              td.appendChild(container);

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
              if (parameterKey === "tags") {
                // Ignore "-"
                if (columnValue !== "-") {
                  // Separate tags
                  let tags = columnValue.split("|||");
                  // Create a container with the .tags-list class
                  let tagsContainer = document.createElement("div");
                  tagsContainer.classList.add("tags-list-table");

                  // Create a span for each tag with the .tag class
                  tags.forEach((tag) => {
                    let tagSpan = document.createElement("span");
                    tagSpan.classList.add("tag");
                    tagSpan.textContent = tag;
                    tagsContainer.appendChild(tagSpan);
                  });

                  // Clear the existing content of the table cell
                  td.innerHTML = "";
                  // Append the tags container to the table cell
                  td.appendChild(tagsContainer);
                } else {
                  // Set the text content to "-"
                  td.textContent = "-";
                }
              } else {
                // For other parameter keys, set the text content directly
                if (parameterKey === "sentiment_trend_class") {
                  // Add a space between capital letters
                  columnValue = columnValue.replace(/([A-Z])/g, " $1").trim();
                }
                td.textContent = columnValue || "!";
              }

              if (checkbox && !checkbox.checked) {
                td.classList.add("hidden-column");
              }

              tr.appendChild(td);
            }
          });
        }
      );

      tbody.appendChild(tr);
      rowCount++;
    });

    console.log(
      `[TIL] Table ${t} populated with ${rowCount} of ${r.length} rows`
    );

    resolve(adminAlerts); // Resolve the promise with the alerts array
  });
}

// Function to populate tags array
function populateTagsArray(tags) {
  console.log("[TIL] Populating tags array");

  // Ignore "-" and "" values
  tags = tags.filter((tag) => tag !== "-" && tag !== "");

  // Populate applicationConfig.tags with tags (ignore duplicates)
  applicationConfig.tags = Array.from(new Set(tags));
}

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
        if (
          column.groupName !== "conversation" &&
          column.groupName !== "key" &&
          column.name !== "Tags"
        ) {
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

// Function to populate the tables and handle alerts
export async function populateTablesAndHandleAlerts(rows, appendMode) {
  // Split rows into two arrays based on the library_type property
  let goodRows = rows.filter((row) => row.library_type === "good");
  let badRows = rows.filter((row) => row.library_type === "bad");

  try {
    // Initialize arrays for alerts
    let goodTableAlerts = [];
    let badTableAlerts = [];

    // Conditionally populate tables
    if (goodRows.length > 0) {
      goodTableAlerts = await populateDomTable(
        "good-table",
        goodRows,
        appendMode
      );
    }
    if (badRows.length > 0) {
      badTableAlerts = await populateDomTable("bad-table", badRows, appendMode);
    }

    // Flatten the returned arrays of alerts into a single array
    const allAlerts = [...goodTableAlerts, ...badTableAlerts];

    // Handle the alerts (e.g., log them, display them to the user, etc.)
    if (allAlerts.length > 0) {
      console.warn(
        "[TIL] Alerts generated during table population:",
        allAlerts
      );
      // Placeholder to notify admins of alerts
    }
  } catch (error) {
    console.error("Error populating tables:", error);
  }
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

  // Add the success or error class based on the responseClass
  if (responseClass === null) {
    responseDiv.classList.remove("success-response", "error-response");
    responseDiv.classList.add("info-response");

    // Append the info SVG to the responseDiv
    responseDiv.appendChild(createSVG("info"));
  } else if (responseClass) {
    responseDiv.classList.remove("info-response", "error-response");
    responseDiv.classList.add("success-response");

    // Append the success SVG to the responseDiv
    responseDiv.appendChild(createSVG("success"));
  } else {
    responseDiv.classList.remove("info-response", "success-response");
    responseDiv.classList.add("error-response");

    // Append the error SVG to the responseDiv
    responseDiv.appendChild(createSVG("error"));
  }
}
