// sessionHandler.js
import { appSharedState } from "./app.js";

export async function startSession() {
  console.log("{am} Starting session");
  let sharedStatePc = appSharedState.clients.PlatformClient;
  console.log("{am} appSharedState.clients = ", appSharedState.clients);

  try {
    // GET Current UserId
    //const uapi = new window.platformClientModule.UsersApi();
    let user = await sharedStatePc.usersApi.getUsersMe({});
    console.log("{am} User details returned", user);
    document.getElementById("content").innerText =
      "Welcome, " + user.name + "!";
  } catch (error) {
    console.error("{am} Error getting user details. ", error);
    throw error;
  }
}
