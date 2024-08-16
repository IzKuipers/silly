import { Log } from "../logging.js";
import { appDataComplete } from "./sanitise.js";
import { AppStore } from "./store.js";

export async function loadApp(data = {}) {
  if (!appDataComplete(data)) {
    throw new Error("Tried to load an app with invalid data!");
  }

  if (isLoaded(data.id)) {
    throw new Error(`Can't load two apps of the same ID!`);
  }

  Log(
    `loadApp`,
    `${data.id}: Loading app: ${data.metadata.name} by ${data.metadata.author} (v${data.metadata.version})`
  );

  try {
    const { default: process } = await import(data.files.js);

    if (!process) throw new Error(`Tried to load an app without an AppProcess`);

    AppStore[data.id] = { data, process };
  } catch {
    throw new Error(`Failed to import "${data.files.js}" for ${data.id}`);
  }
}

// May be subject to disabling and such in the future
export function isLoaded(id) {
  return !!AppStore[id];
}
