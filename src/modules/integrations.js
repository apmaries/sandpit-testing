// integrations.js
// Description: Utility module to handle integrations api

// Shared state modules
import { applicationConfig } from "../core/configManager.js";

// Api instances
import { integrationsApi } from "../app.js";
import { t_integrationsApi } from "../core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.mode.isTest;

// Get integration current config by id
export async function getIntegration(integration) {
  console.log(`[TIL] Getting integration config '${integration}'`);
  let integrationConfig;

  try {
    if (testMode) {
      // Get integration using test API
      integrationConfig = await t_integrationsApi.getIntegrationConfigCurrent();
    } else {
      integrationConfig = await integrationsApi.getIntegrationConfigCurrent(
        integration
      );
    }
  } catch (error) {
    console.error("[TIL] Error getting integration config", error);
    throw error;
  }

  console.debug("[TIL] Integration config returned", integrationConfig);

  return integrationConfig;
}

// Update integration config
export async function updateIntegration() {
  console.log("[TIL] Updating integration config");
  let integrationConfig = applicationConfig.integration;
  const newDatatableId = applicationConfig.datatable.datatable.id;
  console.log("[TIL] New datatable id", newDatatableId);

  // Drop selfUri and id from the integration config
  delete integrationConfig.selfUri;
  delete integrationConfig.id;
  console.debug("[TIL] Integration config", integrationConfig);
  // Update datatable id in the integration url
  let integrationUrl = new URL(integrationConfig.properties.url);
  integrationUrl.searchParams.set("gc_datatable", newDatatableId);

  sessionStorage.setItem("gc_datatable", newDatatableId);

  // Set the updated url in the integration config
  integrationConfig.properties.url = integrationUrl.toString();

  let integrationId = integrationConfig.id; // String | Integration Id
  let body = integrationConfig; // Object | Integration Configuration
  let opts = {
    "body": body, // Object | Integration Configuration
  };
  console.debug("[TIL] Integration update opts", opts);

  if (testMode) {
    return "Integration config updated";
  }

  try {
    await integrationsApi.putIntegrationConfigCurrent(integrationId, opts);
    console.log("[TIL] Integration config updated");
    return "Integration config updated";
  } catch (error) {
    throw error;
  }
}
