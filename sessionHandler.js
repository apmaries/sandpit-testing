// sessionHandler.js
import { uapi } from "./clientHandler.js";

export async function startSession() {
  console.log("{am} Starting session");

  // You can now use uapi here
  console.log("{am} uapi is ready to use:", uapi);

  try {
    // GET Current UserId
    //const uapi = new window.platformClientModule.UsersApi();
    let user = await uapi.getUsersMe({});
    console.log("{am} User details returned", user);
    document.getElementById("content").innerText =
      "Welcome, " + user.name + "!";
  } catch (error) {
    console.error("{am} Error getting user details. ", error);
    throw error;
  }
}
