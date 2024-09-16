// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  testMode: window.location.protocol !== "https:",
  testingData: {
    datatableUrl: "../test/datatable.json",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
