// sessionHandler.js
import { uapi } from "./app.js";

export async function startSession() {
  console.log("{am} Starting session");

  try {
    // GET Current UserId
    let user = await uapi.getUsersMe({});
    console.log("{am} User details returned", user);
    document.getElementById("content").innerText =
      "Welcome, " + user.name + "!";
  } catch (error) {
    console.error("{am} Error getting user details. ", error);
    throw error;
  }
}
