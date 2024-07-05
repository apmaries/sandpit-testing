// sessionHandler.js
import { handleApiCalls } from "./apiHandler.js";

export function startSession(accessToken) {
  sessionStorage.setItem("gc_access_token", accessToken);
  document.getElementById("content").innerText = "Logged in successfully";

  handleApiCalls();
}
