// app.js
import { startSession } from "./sessionHandler.js";

document.addEventListener("DOMContentLoaded", () => {
  // ?gc_clientId=f8083a5d-f18a-4b45-93bb-994a88243c23&gc_region=mypurecloud.com.au
  console.log("{am} window.location:", window.location);
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("gc_clientId");
  const region = urlParams.get("gc_region");

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      startSession(accessToken);
    } else {
      console.error("{am} Access token not found in URL hash.");
    }
  } else {
    initiateLogin(clientId, region);
  }
});

function initiateLogin(clientId, region) {
  if (!clientId || !region) {
    console.error(
      "{am} Client ID and region must be provided in the URL parameters."
    );
    return;
  }

  PlatformClient.login({
    clientId: clientId,
    region: region,
    redirectUri: window.location.origin,
    responseType: "token",
  });
}
