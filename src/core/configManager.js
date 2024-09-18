// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  mode: {
    isAdmin: false,
    isTest: window.location.protocol !== "https:",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
