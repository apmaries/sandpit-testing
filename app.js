import { startSession } from "./sessionHandler.js";
let platformClientModule = require("platformClient");
const PlatformClient = platformClientModule.ApiClient.instance;

document.addEventListener("DOMContentLoaded", () => {
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
    // Ensure PlatformClient is available before calling initiateLogin
    if (PlatformClient) {
      initiateLogin(gc_clientId, gc_region, gc_redirectUrl);
    } else {
      console.error("{am} PlatformClient is not defined.");
      console.error("{am} window", window);
    }
  }
});

async function initiateLogin(gc_clientId, gc_region, gc_redirectUrl) {
  console.log("{am} Login initiated.");
  try {
    console.log("{am} Setting up PlatformClient.", PlatformClient);
    PlatformClient.setEnvironment(gc_region);
    PlatformClient.setPersistSettings(true, "_am_");
    PlatformClient.setReturnExtendedResponses(true);

    console.log("%c{am} Logging in to Genesys Cloud", "color: green");
    await PlatformClient.loginImplicitGrant(
      gc_clientId,
      "https://apmaries.github.io/sandpit-testing/index.html",
      {}
    );

    // GET Current UserId
    const uapi = new PlatformClient.UsersApi();
    let user = await uapi.getUsersMe({});
    console.log(user);

    // Enter in starting code.
  } catch (err) {
    console.log("{am} Error: ", err);
  }
}
