import { startSession } from "./sessionHandler.js";

// Ensure PlatformClient is available globally
let platformClientModule = require("platformClient");
window.PlatformClient = platformClientModule.ApiClient.instance;

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
    if (window.PlatformClient) {
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
      startSession(accessToken);
    }
  } else {
    console.error("{am} Something is really wrong :(");
  }
});

async function initiateLogin(gc_clientId, gc_region, gc_redirectUrl) {
  console.log("{am} Login initiated.");
  try {
    console.log("{am} Setting up PlatformClient.", window.PlatformClient);
    window.PlatformClient.setEnvironment(gc_region);
    window.PlatformClient.setPersistSettings(true, "_am_");
    window.PlatformClient.setReturnExtendedResponses(true);

    console.log("%c{am} Logging in to Genesys Cloud", "color: green");
    await window.PlatformClient.loginImplicitGrant(
      gc_clientId,
      gc_redirectUrl,
      {}
    );
  } catch (err) {
    console.log("{am} Error: ", err);
  }
}
