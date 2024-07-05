// sessionHandler.js

export async function startSession() {
  const PlatformClient = window.PlatformClient;
  console.log("{am} Starting session", PlatformClient);

  // GET Current UserId
  const uapi = new window.platformClientModule.UsersApi();
  let user = await uapi.getUsersMe({});
  console.log("{am} User details returned", user);
  document.getElementById("content").innerText = "Welcome, " + user.name + "!";
}
