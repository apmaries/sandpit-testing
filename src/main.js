// main.js
// Description: Main application module

import { applicationConfig } from "./handler-modules/configHandler.js";

const testMode = applicationConfig.testMode;
("use strict");

export function runApp() {
  console.log("{am} Initializing main app");

  // Add the logic for the rest of your app here.
  // You can use the user details passed from the startSession function.

  // Example: Load additional modules or components
  loadDashboard();
  setupEventListeners();
  // more app initialization code...
}

function loadDashboard() {
  // Example function to load the dashboard
  console.log("{am} Loading dashboard");
  // Add your dashboard loading logic here
}

function setupEventListeners() {
  // Example function to set up event listeners
  console.log("{am} Setting up event listeners");
  // Add your event listener setup logic here
}
