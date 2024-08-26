// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  testMode: window.location.protocol !== "https:",
  testing: {
    businessUnitsUrl: "/sandpit-testing/test/businessUnits.json",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
