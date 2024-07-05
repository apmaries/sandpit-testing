// sessionHandler.js
import { handleApiCalls } from "./apiHandler.js";

export async function startSession(accessToken) {
  sessionStorage.setItem("gc_access_token", accessToken);
  document.getElementById("content").innerText = "Logged in successfully";

  // GET Current UserId
  const uapi = new window.PlatformClient.UsersApi();
  let user = await uapi.getUsersMe({});
  console.log(user);
}
