import { startSession } from "./sessionHandler.js";
/*
// Define global variables
window.am = window.am || {};
window.am.platformClientModule = require("platformClient");
window.am.PlatformClient = window.am.platformClientModule.ApiClient.instance;

// Define neccessary API client instances
window.am.usersApi = new window.am.platformClientModule.UsersApi();
*/

document.addEventListener("DOMContentLoaded", () => {
  console.log("{am} window.location:", window.location);
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

    // Define global variables
    window.am = window.am || {};
    window.am.platformClientModule = require("platformClient");
    window.am.PlatformClient =
      window.am.platformClientModule.ApiClient.instance;

    // Define neccessary API client instances
    window.am.usersApi = new window.am.platformClientModule.UsersApi();

    if (window.am.PlatformClient) {
      initiateLogin(gc_clientId, gc_region, gc_redirectUrl);
    } else {
      console.error("{am} PlatformClient is not defined.");
      console.error("{am} window", window);
    }
  } else if (accessToken) {
    console.log("{am} Redirect after successful login detected");
    if (!sessionStorage.getItem("gc_access_token")) {
      sessionStorage.setItem("gc_access_token", accessToken);
      console.log("{am} Access token stored in sessionStorage");
    }
    startSession();
  } else {
    console.error("{am} Something is really wrong :(");
  }
});

async function initiateLogin(gc_clientId, gc_region, gc_redirectUrl) {
  console.log("{am} Login initiated.");
  try {
    console.log("{am} Setting up PlatformClient.", window.am.PlatformClient);
    window.am.PlatformClient.setEnvironment(gc_region);
    window.am.PlatformClient.setPersistSettings(true, "_am_");
    window.am.PlatformClient.setReturnExtendedResponses(true);

    console.log("%c{am} Logging in to Genesys Cloud", "color: green");
    await window.am.PlatformClient.loginImplicitGrant(
      gc_clientId,
      gc_redirectUrl,
      {}
    );
  } catch (err) {
    console.log("{am} Error: ", err);
  }
}
