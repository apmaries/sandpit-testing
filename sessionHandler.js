// sessionHandler.js
import { handleApiCalls } from "./apiHandler.js";

export async function startSession() {
  document.getElementById("content").innerText = "Logged in successfully";
  const PlatformClient = window.PlatformClient;

  // GET Current UserId
  const uapi = new PlatformClient.UsersApi();
  let user = await uapi.getUsersMe({});
  console.log(user);
}
