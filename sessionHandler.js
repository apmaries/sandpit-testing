// sessionHandler.js

export async function startSession() {
  const PlatformClient = window.PlatformClient;

  // GET Current UserId
  const uapi = new PlatformClient.UsersApi();
  let user = await uapi.getUsersMe({});
  console.log("{am} User details returned", user);
  document.getElementById("content").innerText = "Welcome, " + user.name + "!";
}
