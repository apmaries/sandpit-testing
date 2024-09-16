// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  testMode: window.location.protocol !== "https:",
  testingData: {
    datatableUrl: "/sandpit-testing/test/datatables.csv",
    businessUnitsUrl: "/sandpit-testing/test/businessUnits.json",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
