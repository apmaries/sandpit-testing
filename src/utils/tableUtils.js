// populateTable.js
// Description: Utility for populating a table with data

// Utility function to populate the table with data
export function populateTable(t, r) {
  let table = document.getElementById(t);
  let tbody = table.getElementsByTagName("tbody")[0];
  tbody.innerHTML = ""; // Clear existing rows

  r.forEach((row) => {
    let tr = document.createElement("tr");

    // Map JSON fields to table columns
    let columnMapping = {
      "conversation-id": row.key,
      "division-name": row.division_name,
      "conversation-start": row.conversation_start,
      "conversation-end": row.conversation_end,
      "queue-name": row.queue_name,
      "media-type": row.media_type,
      "evaluation-score": row.evaluation_total_score,
      "sentiment-score": row.sentiment_score,
      "sentiment-trend": row.sentiment_trend,
      "empathy-score": row.empathy_score,
    };

    Object.keys(columnMapping).forEach((key) => {
      let td = document.createElement("td");

      if (key === "conversation-id") {
        let region = sessionStorage.getItem("gc_region");
        let a = document.createElement("a");
        a.href = `https://apps.${region}/directory/#/analytics/interactions/${row.key}/admin/details`;
        a.target = "_blank";
        a.appendChild(document.createTextNode(columnMapping[key] || ""));
        td.appendChild(a);
      } else {
        td.appendChild(document.createTextNode(columnMapping[key] || ""));
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  console.log(`[TIL] Table ${t} populated with ${r.length} rows`);
}
