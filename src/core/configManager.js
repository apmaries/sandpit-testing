// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  inbound: { inboundMode: false, inboundFcId: null },
  notifications: {
    uri: "",
    id: "",
  },
  testMode: window.location.protocol !== "https:",
  testing: {
    outboundAggregatesDataUrl:
      "/sandpit-testing/test/outboundAggregateData.json",
    businessUnitsUrl: "/sandpit-testing/test/businessUnits.json",
    businessUnitSettingsUrl: "/sandpit-testing/test/bu.json",
    planningGroupsUrl: "/sandpit-testing/test/planningGroups.json",
    campaignsUrl: "/sandpit-testing/test/campaigns.json",
    inboundFcDataUrl: "/sandpit-testing/test/inboundForecastData.json",
  },
  // Add more configuration options as needed
};

export { applicationConfig };
