import { Log } from "../logging.js";
import { loadApp } from "./load.js";
import { spawnApp } from "./spawn.js";
import { builtInApps } from "./store.js";

// Function to load all first-party applications
export async function loadBuiltinApps(uuid) {
  Log("loadBuiltinApps", `Loading ${builtInApps.length} apps.`);

  // For every app of the built-in apps...
  for (const app of builtInApps) {
    await loadApp(app); // Load it into the store

    // Can it be run immediately?
    if (app.core || app.autoRun) {
      // Run it immediately.
      await spawnApp(app.id, undefined, uuid);
    }
  }
}
