// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  inboundMode: false,
  notifications: {
    uri: "",
    id: "",
  },
  testMode: window.location.protocol !== "https:",
  testing: {
    outboundAggregatesDataUrl:
      "/outboundForecastGenerator/test/source/outboundAggregateData.json",
    businessUnitsUrl:
      "/outboundForecastGenerator/test/source/businessUnits.json",
    businessUnitSettingsUrl: "/outboundForecastGenerator/test/source/bu.json",
    planningGroupsUrl:
      "/outboundForecastGenerator/test/source/planningGroups.json",
    campaignsUrl: "/outboundForecastGenerator/test/source/campaigns.json",
    inboundFcDataUrl:
      "/outboundForecastGenerator/test/source/inboundForecastData.json",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
