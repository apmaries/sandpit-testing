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
  // Extract the columns from the datatableColumns object
  const columns = Object.entries(
    applicationConfig.datatable.datatableColumns
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

        // Apply hidden-column class to all groups except "conversation"
        if (column.groupName !== "conversation") {
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
export function populateDomTable(t, r) {
  let table = document.getElementById(t);
  let tbody = table.getElementsByTagName("tbody")[0];
  tbody.innerHTML = ""; // Clear existing rows

  r.forEach((row) => {
    let tr = document.createElement("tr");

    // Map JSON fields to table columns with group names
    let columnMapping = {
      "conversation-id": { value: row.key, group: "conversation" },
      "division-name": { value: row.division_name, group: "conversation" },
      "conversation-start": {
        value: row.conversation_start,
        group: "conversation",
      },
      "conversation-end": {
        value: row.conversation_end,
        group: "conversation",
      },
      "queue-name": { value: row.queue_name, group: "conversation" },
      "media-type": { value: row.media_type, group: "conversation" },
      "evaluation-score": {
        value: row.evaluation_total_score,
        group: "evaluation",
      },
      "sentiment-score": { value: row.sentiment_score, group: "sta" },
      "sentiment-trend": { value: row.sentiment_trend, group: "sta" },
      "empathy-score": { value: row.empathy_score, group: "sta" },
    };

    Object.keys(columnMapping).forEach((key) => {
      let td = document.createElement("td");
      td.setAttribute("data-group-name", columnMapping[key].group);

      if (key === "conversation-id") {
        let region = sessionStorage.getItem("gc_region");
        let a = document.createElement("a");
        a.href = `https://apps.${region}/directory/#/analytics/interactions/${row.key}/admin/details`;
        a.target = "_blank";
        a.appendChild(document.createTextNode(columnMapping[key].value || ""));
        td.appendChild(a);
      } else {
        td.appendChild(document.createTextNode(columnMapping[key].value || ""));
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  console.log(`[TIL] Table ${t} populated with ${r.length} rows`);
}

// Function to update management tools response
export function updateManagementToolsResponse(ele, response) {
  let responseDiv = ele;
  responseDiv.innerText = response;
}
