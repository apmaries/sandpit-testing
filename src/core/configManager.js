// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  notifications: {
    uri: "",
    id: "",
  },
  testMode: window.location.protocol !== "https:",
  // Add more configuration options as needed
};

export { applicationConfig };
