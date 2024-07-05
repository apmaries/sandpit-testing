// app.js
import { startSession } from "./sessionHandler.js";

document.addEventListener("DOMContentLoaded", () => {
  // ?gc_clientId=f8083a5d-f18a-4b45-93bb-994a88243c23&gc_region=mypurecloud.com.au

  let url = new URL(document.location.href);
  const gc_region = url.searchParams.get("gc_region");
  const gc_clientId = url.searchParams.get("gc_clientId");
  const gc_redirectUrl = url.searchParams.get("gc_redirectUrl");

  if (!gc_region || !gc_clientId || !gc_redirectUrl) {
    console.error(
      "{am} Client ID, region or redirect url not found in URL parameters."
    );
    console.log("{am} window.location:", window.location);
    return;
  }

  if (window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      startSession(accessToken);
    } else {
      console.error("{am} Access token not found in URL hash.");
    }
  } else {
    initiateLogin(gc_clientId, gc_region, gc_redirectUrl);
  }
});

async function initiateLogin(gc_clientId, gc_region, gc_redirectUrl) {
  try {
    PlatformClient.setEnvironment(gc_region);
    PlatformClient.setPersistSettings(true, "_am_");
    PlatformClient.setReturnExtendedResponses(true);

    console.log("%cLogging in to Genesys Cloud", "color: green");
    await PlatformClient.loginImplicitGrant(gc_clientId, gc_redirectUrl, {});

    //GET Current UserId
    let user = await uapi.getUsersMe({});
    console.log(user);

    //Enter in starting code.
  } catch (err) {
    console.log("Error: ", err);
  }
}
