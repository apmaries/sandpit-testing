import { startSession } from "./sessionHandler.js";
/*
// Define global variables
window.am = window.am || {};
window.am.platformClientModule = require("platformClient");
window.am.PlatformClient = window.am.platformClientModule.ApiClient.instance;

// Define neccessary API client instances
window.am.usersApi = new window.am.platformClientModule.UsersApi();
*/

// Define and export shared state object
export let appSharedState = {
  generatedForecast: null,
  modifiedForecast: null,
  userInputs: {
    businessUnit: {
      name: null,
      id: null,
      settings: null,
    },
    forecastParameters: {
      weekStart: null,
      historicalWeeks: null,
      description: null,
    },
    forecastOptions: {
      ignoreZeroes: null,
      resolveContactsAhtMode: null,
      generateInbound: null,
      retainInbound: null,
    },
    planningGroups: [],
  },
  clients: {
    PlatformClient: {
      client: null,
      module: null,
    },
    ClientApp: null,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("{am} window.location:", window.location);
  console.log("{am} appSharedState at DOMContentLoaded", appSharedState);
  const urlParams = new URLSearchParams(window.location.search);
  const gc_region = urlParams.get("gc_region");
  const gc_clientId = urlParams.get("gc_clientId");
  const gc_redirectUrl = urlParams.get("gc_redirectUrl");

  const urlHash = window.location.hash.substr(1);
  const hashParams = new URLSearchParams(urlHash);
  const accessToken = hashParams.get("access_token");

  if (gc_region && gc_clientId && gc_redirectUrl) {
    console.log(
      "{am} Initial login parameters found in URL. Initiating login.",
      gc_region,
      gc_clientId,
      gc_redirectUrl
    );

    // Define clients object in shared state
    let platformClientModule = require("platformClient");
    let sharedStatePc = appSharedState.clients.PlatformClient;
    sharedStatePc.module = platformClientModule;
    sharedStatePc.client = platformClientModule.ApiClient.instance;

    // Define neccessary API client instances
    if (sharedStatePc.client) {
      initiateLogin(gc_clientId, gc_region, gc_redirectUrl);
    } else {
      console.error("{am} PlatformClient is not defined.");
      console.error("{am} window", window);
    }
    console.log("{am} appSharedState at end of inital load", appSharedState);
  } else if (accessToken) {
    console.log("{am} Redirect after successful login detected");
    if (!sessionStorage.getItem("gc_access_token")) {
      sessionStorage.setItem("gc_access_token", accessToken);
      console.log("{am} Access token stored in sessionStorage");
    }
    console.log("{am} appSharedState before sessionStart", appSharedState);
    startSession();
  } else {
    console.error("{am} Something is really wrong :(");
  }
});

async function initiateLogin(gc_clientId, gc_region, gc_redirectUrl) {
  console.log("{am} Login initiated.");
  let sharedStatePc = appSharedState.clients.PlatformClient;
  try {
    console.log("{am} Setting up PlatformClient.", sharedStatePc.client);
    sharedStatePc.client.setEnvironment(gc_region);
    sharedStatePc.client.setPersistSettings(true, "_am_");
    sharedStatePc.client.setReturnExtendedResponses(true);

    console.log("%c{am} Logging in to Genesys Cloud", "color: green");
    await sharedStatePc.client.loginImplicitGrant(
      gc_clientId,
      gc_redirectUrl,
      {}
    );
  } catch (err) {
    console.log("{am} Error: ", err);
  }
}
