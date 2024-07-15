// importHandler.js
// Description: Module to handle the import of forecast data

// API instances
import { wapi } from "../app.js";
import { applicationConfig } from "../core/configManager.js";
import { t_wapi } from "../core/testManager.js";

// App modules
import { calculateWeightedAverages } from "./numberHandler.js";

// Function to prepare the forecast import body
export async function prepFcImportBody(groups, buStartDayOfWeek, description) {
  console.log("[OFG] Preparing Forecast Import Body and encoding to gzip");

  // Function to gzip encode the body
  function gzipEncode(body) {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(body));
    return pako.gzip(data);
  }

  // Function to round the values to 2 decimal places
  function roundToTwo(num) {
    return +(Math.round(num + "e+2") + "e-2");
  }

  // Build the body for the forecast import
  let planningGroupsArray = [];

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const planningGroup = group.planningGroup;
    const forecastData = group.forecastData;

    if (!forecastData) {
      console.warn(`[OFG] [${planningGroup.name}] No forecast data found`);
      continue;
    }
    console.debug(`[OFG] [${planningGroup.name}] Processing forecast data`);

    // Reorder arrays to align to BU start day of week
    const nContacts = forecastData.nContacts;
    const tHandle = forecastData.tHandle;
    const nHandled = forecastData.nHandled;

    const weightedAverages = calculateWeightedAverages(tHandle, nHandled);
    const aHandleTime = weightedAverages.intervalAverages;

    const daysOfWeek = applicationConfig.daysOfWeek;

    const dayOfWeekFiltered = daysOfWeek.filter((day) => day.id !== "99");
    const buStartDayIndex = dayOfWeekFiltered.findIndex(
      (day) => day.name === buStartDayOfWeek
    );

    const nContactsReordered = [];
    const aHandleTimeReordered = [];

    for (let i = 0; i < nContacts.length; i++) {
      const index = (buStartDayIndex + i) % 7;
      nContactsReordered.push(nContacts[index]);
      aHandleTimeReordered.push(aHandleTime[index]);
    }

    // Replicate the new 0 index at the end of the arrays
    nContactsReordered.push(nContactsReordered[0]);
    aHandleTimeReordered.push(aHandleTimeReordered[0]);

    // Flatten the arrays
    const offeredPerInterval = nContactsReordered.flat();
    const averageHandleTimeSecondsPerInterval = aHandleTimeReordered.flat();

    // Round data per interval to 2 decimal places
    // offered
    for (let i = 0; i < offeredPerInterval.length; i++) {
      offeredPerInterval[i] = roundToTwo(offeredPerInterval[i]);
    }
    // aht
    for (let i = 0; i < averageHandleTimeSecondsPerInterval.length; i++) {
      averageHandleTimeSecondsPerInterval[i] = roundToTwo(
        averageHandleTimeSecondsPerInterval[i]
      );
    }

    // Create the object for the planning group
    let pgObj = {
      "planningGroupId": planningGroup.id,
      "offeredPerInterval": offeredPerInterval,
      "averageHandleTimeSecondsPerInterval":
        averageHandleTimeSecondsPerInterval,
    };
    planningGroupsArray.push(pgObj);
  }

  // Create the forecast import body
  let fcImportBody = {
    "description": description,
    "weekCount": 1,
    "planningGroups": planningGroupsArray,
  };

  // downloadJson(fcImportBody, "fcImportBody");

  let fcImportGzip = gzipEncode(fcImportBody);
  let contentLengthBytes = fcImportGzip.length;

  console.log(`[OFG] Body encoded to gzip with length: ${contentLengthBytes}`);

  return [fcImportBody, fcImportGzip, contentLengthBytes];
}

// Function to generate the URL for the forecast import
export async function generateUrl(
  businessUnitId,
  weekDateId,
  contentLengthBytes
) {
  console.log("[OFG] Generating URL for import");

  let importUrl = null;
  try {
    importUrl =
      await wapi.postWorkforcemanagementBusinessunitWeekShorttermforecastsImportUploadurl(
        businessUnitId,
        weekDateId,
        {
          "contentLengthBytes": contentLengthBytes,
        }
      );
  } catch (error) {
    console.error("[OFG] Error generating import URL: ", error);
    throw error;
  }

  return importUrl;
}

// Function to invoke server-side GCF to upload the forecast data
export async function invokeGCF(uploadAttributes, forecastData) {
  console.log("[OFG] Invoking GCF");
  // Get client id from session storage
  const clientId = sessionStorage.getItem("oauth_client");

  // Define the URL for the GCF
  const url =
    "https://us-central1-outboundforecastgenerator.cloudfunctions.net/makePUT"; // GCF URL
  const apiKey = clientId; // Using users OAuth client id as API key

  const uploadUrl = uploadAttributes.url;
  const uploadHeaders = uploadAttributes.headers;

  const data = {
    url: uploadUrl,
    header: uploadHeaders,
    data: forecastData,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": apiKey,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.error(`[OFG] GCF HTTP error! status: ${response.status}`);
    return null;
  }

  console.log(`[OFG] GCF response status: `, response.status);
  return response.status;
}

// Function to import the forecast data
export async function importFc(businessUnitId, weekDateId, uploadKey) {
  console.log("[OFG] Importing forecast");

  let importResponse = null;
  try {
    importResponse =
      await wapi.postWorkforcemanagementBusinessunitWeekShorttermforecastsImport(
        businessUnitId, // Pass selected Business Unit ID
        weekDateId, // Pass selected Week Date ID
        {
          "uploadKey": uploadKey,
        }
      );
  } catch (error) {
    console.error("[OFG] Error importing forecast: ", error);
    throw error;
  }

  console.debug("[OFG] Import response: ", importResponse);
  console.log("[OFG] Forecast import complete");
  return importResponse;
}
