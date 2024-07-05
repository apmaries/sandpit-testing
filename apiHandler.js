// apiHandler.js
export function handleApiCalls() {
  const accessToken = sessionStorage.getItem("access_token");
  if (!accessToken) {
    console.error("{am} No access token found in session.");
    return;
  }

  // Initialize PlatformClient with the access token
  PlatformClient.setAccessToken(accessToken);

  // Example API call using PlatformClient SDK
  PlatformClient.get("/data")
    .then((response) => {
      console.log("API data:", response);
      document.getElementById("content").innerText = JSON.stringify(
        response,
        null,
        2
      );
    })
    .catch((error) => {
      console.error("{am} Error fetching API data:", error);
    });
}
