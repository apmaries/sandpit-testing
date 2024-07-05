// app.js
import { startSession } from "./sessionHandler.js";

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("client_id");
  const region = urlParams.get("region");

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      startSession(accessToken);
    } else {
      console.error("Access token not found in URL hash.");
    }
  } else {
    initiateLogin(clientId, region);
  }
});

function initiateLogin(clientId, region) {
  if (!clientId || !region) {
    console.error(
      "Client ID and region must be provided in the URL parameters."
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
