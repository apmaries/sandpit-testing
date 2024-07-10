// inboundHandler.js
// Description: Module to handle inbound forecast generation and deletion

// API instances
import { wapi } from "../app.js";
import { t_wapi } from "../core/testManager.js";

// Shared state modules
import { applicationConfig } from "../core/configManager.js";
import { applicationState } from "../core/stateManager.js";

// App modules
import { NotificationHandler } from "./notificationHandler.js";

// Declare global variables
const testMode = applicationConfig.testMode;
let generateOperationId;
("use strict");

// Generate the forecast
async function generateAbmForecast(buId, weekStart, description) {
  console.log("[OFG] Generating ABM forecast");
  const abmFcDescription = description + " ([OFG] Inbound ABM)";

  let body = {
    "description": abmFcDescription,
    "weekCount": 1,
    "canUseForScheduling": true,
  };
  let opts = {
    "forceAsync": true,
  };

  try {
    generateResponse =
      await wapi.postWorkforcemanagementBusinessunitWeekShorttermforecastsGenerate(
        buId,
        weekStart,
        body,
        opts
      );
    console.log(
      `[OFG] Inbound forecast generate status = ${generateResponse.status}`
    );
    return generateResponse;
  } catch (error) {
    console.error("[OFG] Inbound forecast generation failed!", error);
    throw error;
  }
}

// Function to retrieve the inbound forecast data
async function getInboundForecastData(forecastId) {
  const buId = applicationState.userInputs.businessUnit.id;
  const weekStart = applicationState.userInputs.forecastParameters.weekStart;

  console.log("[OFG] Getting inbound forecast data");

  try {
    const forecastData = testMode
      ? await t_wapi.getInboundShorttermforecastData()
      : await wapi.getWorkforcemanagementBusinessunitWeekShorttermforecastData(
          buId,
          weekStart,
          forecastId
        );
    console.log(
      "[OFG] Inbound forecast data retrieved. Trimming to 7 days only",
      forecastData
    );

    // Trim results to 7 days only (8th day will be re-added later after modifications)
    forecastData.result.planningGroups.forEach((pg) => {
      console.debug(
        `[OFG] Trimming data for Planning Group ${pg.planningGroupId}`
      );
      pg.offeredPerInterval = pg.offeredPerInterval.slice(0, 672);
      pg.averageHandleTimeSecondsPerInterval =
        pg.averageHandleTimeSecondsPerInterval.slice(0, 672);
    });

    return forecastData;
  } catch (error) {
    console.error("[OFG] Inbound forecast data retrieval failed!", error);
    throw error;
  }
}

// Handle the asynchronous forecast generation
async function handleAsyncForecastGeneration(buId) {
  const topics = ["shorttermforecasts.generate"];

  function onSubscriptionSuccess() {
    console.log(
      "[OFG] Successfully subscribed to forecast generate notifications"
    );
  }

  const generateNotifications = new NotificationHandler(
    topics,
    buId,
    onSubscriptionSuccess,
    handleInboundForecastNotification
  );

  generateNotifications.connect();
  generateNotifications.subscribeToNotifications();

  return new Promise((resolve, reject) => {
    const handleComplete = (event) => {
      window.removeEventListener("inboundForecastComplete", handleComplete);
      window.removeEventListener("inboundForecastError", handleError);
      resolve(event.detail);
    };

    const handleError = (event) => {
      window.removeEventListener("inboundForecastComplete", handleComplete);
      window.removeEventListener("inboundForecastError", handleError);
      reject(new Error("Inbound forecast generation failed"));
    };

    window.addEventListener("inboundForecastComplete", handleComplete);
    window.addEventListener("inboundForecastError", handleError);
  });
}

// Handle the inbound forecast notification
async function handleInboundForecastNotification(notification) {
  console.debug("[OFG] Message from server: ", notification);
  if (
    notification.eventBody &&
    notification.eventBody.operationId === generateOperationId
  ) {
    const status = notification.eventBody.status;
    console.log(`[OFG] Generate inbound forecast status updated <${status}>`);

    if (status === "Complete") {
      const forecastId = notification.eventBody.result.id;
      applicationConfig.inbound.inboundForecastId = forecastId;
      const inboundForecastData = await getInboundForecastData(forecastId);
      await transformAndLoadInboundForecast(inboundForecastData);
      window.dispatchEvent(
        new CustomEvent("inboundForecastComplete", {
          detail: inboundForecastData,
        })
      );
    } else {
      window.dispatchEvent(new CustomEvent("inboundForecastError"));
    }
  }
}

// Function to transform and load inbound forecast data
async function transformAndLoadInboundForecast(inboundFcData) {
  const weekStart = applicationState.userInputs.forecastParameters.weekStart;

  // Add inbound forecast data to generatedForecast if pgId not already present
  console.log("[OFG] Merging inbound forecast data with completed forecast");

  // Process each planning group in inbound forecast data
  inboundFcData.result.planningGroups.forEach((pg) => {
    // Find the planning group in applicationState.generatedForecast
    const completedFcPg =
      applicationState.forecastOutputs.generatedForecast.find(
        (pgForecast) => pgForecast.planningGroup.id === pg.planningGroupId
      );
    const isInbound = completedFcPg.metadata.forecastMode === "inbound";

    if (isInbound) {
      // Transform inbound forecast data to same schema as outbound forecast data
      let nContactsArray = [];
      let tHandleArray = [];

      for (let i = 0; i < pg.offeredPerInterval.length; i += 96) {
        let chunkOffered = pg.offeredPerInterval.slice(i, i + 96);
        let chunkAht = pg.averageHandleTimeSecondsPerInterval.slice(i, i + 96);
        let chunkTht = chunkOffered.map((val, idx) => val * chunkAht[idx]);

        nContactsArray.push(chunkOffered);
        tHandleArray.push(chunkTht);
      }

      // Get the day of the week from weekStart
      let date = new Date(weekStart);
      let dayOfWeek = date.getDay();

      // Calculate the difference between the current day of the week and Sunday
      let rotateBy = (7 - dayOfWeek) % 7;

      // Rotate the arrays
      nContactsArray = [
        ...nContactsArray.slice(rotateBy),
        ...nContactsArray.slice(0, rotateBy),
      ];
      tHandleArray = [
        ...tHandleArray.slice(rotateBy),
        ...tHandleArray.slice(0, rotateBy),
      ];

      let forecastData = {
        nContacts: nContactsArray,
        tHandle: tHandleArray,
        nHandled: nContactsArray, // Replicating nContacts for now - inbound forecast doesn't have nHandled data and need something to divide by when making modifications
      };

      completedFcPg.forecastData = forecastData;
    }
  });
}

// Primary function to generate the inbound forecast
export async function generateInboundForecast() {
  console.log("[OFG] Initiating inbound forecast generation");

  const buId = applicationState.userInputs.businessUnit.id;
  const weekStart = applicationState.userInputs.forecastParameters.weekStart;
  const description =
    applicationState.userInputs.forecastParameters.description;

  // Return test data if in test mode
  if (testMode) {
    const inboundForecastData = await getInboundForecastData();
    console.log(
      "[OFG] Forecast data loaded from test data",
      inboundForecastData
    );
    await transformAndLoadInboundForecast(inboundForecastData);
    applicationConfig.inbound.inboundForecastId = "abc-123";
    return;
  }

  // Generate the forecast and immediately check its status
  const generateResponse = await generateAbmForecast(
    buId,
    weekStart,
    description
  );

  if (generateResponse.status === "Complete") {
    // Synchronous handling if the forecast is already complete
    const forecastId = generateResponse.result.id;
    applicationConfig.inbound.inboundForecastId = forecastId;
    const inboundForecastData = await getInboundForecastData(forecastId);
    await transformAndLoadInboundForecast(inboundForecastData);
    console.log(
      "[OFG] Inbound forecast generation complete",
      inboundForecastData
    );
    return inboundForecastData;
  } else if (generateResponse === "Processing") {
    // Asynchronous handling through notifications
    return handleAsyncForecastGeneration(buId);
  } else {
    console.error(
      "[OFG] Inbound forecast generation failed with initial status: ",
      generateResponse
    );
    throw new Error("Inbound forecast generation failed");
  }
}

// Function to delete the inbound forecast
export function deleteInboundForecast() {
  console.log(
    `[OFG] Deleting inbound forecast with id: ${applicationConfig.inbound.inboundForecastId}`
  );

  const buId = applicationState.userInputs.businessUnit.id;
  const weekStart = applicationState.userInputs.forecastParameters.weekStart;
  const forecastId = applicationConfig.inbound.inboundForecastId;

  // Return if forecast ID is not set
  if (!forecastId) {
    console.warn("[OFG] Inbound forecast ID not set. Skipping deletion");
    return;
  }

  // Return if in test mode
  if (testMode) {
    return;
  }

  // Delete the forecast
  let delResponse = null;
  try {
    delResponse = handleApiCalls(
      "WorkforceManagementApi.deleteWorkforcemanagementBusinessunitWeekShorttermforecast",
      buId,
      weekStart,
      forecastId
    );
  } catch (error) {
    console.error("[OFG] Inbound forecast deletion failed!", error);
    throw error;
  }

  // Reset the forecast ID
  applicationConfig.inbound.inboundForecastId = null;
  console.log("[OFG] Inbound forecast deleted", delResponse);
}
