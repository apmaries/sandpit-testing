// analytics.js
// Description: Utility module to handle analytics api

// Shared state modules
import { applicationConfig } from "./core/configManager.js";

// Api instances
import { conversationsApi } from "./app.js";
import { t_conversationsApi } from "./core/testManager.js";

// Utility modules

// Global variables
("use strict");
const testMode = applicationConfig.testMode;
