// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  testMode: window.location.protocol !== "https:",
  testingData: {
    datatableUrl: "../test/datatable.json",
    conversationsUrl: "../test/conversation_details.json",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
