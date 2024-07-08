// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  testMode: window.location.protocol !== "https:",
  inboundForecastMode: false,
  // Add more configuration options as needed
};

export { applicationConfig };
