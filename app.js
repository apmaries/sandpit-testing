// app.js
import { startSession } from "./sessionHandler.js";

document.addEventListener("DOMContentLoaded", () => {
  // ?gc_clientId=f8083a5d-f18a-4b45-93bb-994a88243c23&gc_region=mypurecloud.com.au
  console.log("{am} window.location:", window.location);
  const urlParams = new URLSearchParams(window.location.search);
  const gc_region = urlParams.get("gc_region");
  const gc_clientId = urlParams.get("gc_clientId");
  const gc_redirectUrl = urlParams.get("gc_redirectUrl");

  if (!gc_region || !gc_clientId || !gc_redirectUrl) {
    console.error(
      "{am} Client ID, region or redirect url not found in URL parameters.",
      window.location
    );
    return;
  }

  if (window.location.hash) {
    console.log("{am} Window location has hash.");
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");

    if (accessToken) {
      startSession(accessToken);
    } else {
      console.error("{am} Access token not found in URL hash.");
    }
  } else {
    console.log("{am} Initiating login.");
    initiateLogin(gc_clientId, gc_region, gc_redirectUrl);
  }
});

async function initiateLogin(gc_clientId, gc_region, gc_redirectUrl) {
  console.log("{am} Login initiated.");
  try {
    console.log("{am} Setting up PlatformClient.", PlatformClient);
    PlatformClient.setEnvironment(gc_region);
    PlatformClient.setPersistSettings(true, "_am_");
    PlatformClient.setReturnExtendedResponses(true);

    console.log("%cLogging in to Genesys Cloud", "color: green");
    await PlatformClient.loginImplicitGrant(gc_clientId, gc_redirectUrl, {});

    //GET Current UserId
    const uapi = new platformClient.UsersApi();
    let user = await uapi.getUsersMe({});
    console.log(user);

    //Enter in starting code.
  } catch (err) {
    console.log("Error: ", err);
  }
}
