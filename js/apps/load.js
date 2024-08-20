import { Log } from "../logging.js";
import { AppLoadError } from "./error.js";
import { appDataComplete } from "./sanitise.js";
import { AppStore } from "./store.js";

export async function loadApp(data = {}) {
  if (!appDataComplete(data)) {
    throw new AppLoadError("Tried to load an app with invalid data!");
  }

  if (isLoaded(data.id)) {
    throw new AppLoadError(`Can't load two apps of the same ID!`);
  }

  Log(
    `loadApp`,
    `${data.id}: Loading app: ${data.metadata.name} by ${data.metadata.author} (v${data.metadata.version})`
  );

  try {
    const { default: process } = await import(data.files.js);

    if (!process)
      throw new AppLoadError(`Tried to load an app without an AppProcess`);

    const store = AppStore.get();

    store[data.id] = { data, process };

    AppStore.set(store);
  } catch (e) {
    throw new AppLoadError(
      `Failed to import "${data.files.js}" for ${data.id}: ${e.message}`
    );
  }
}

// May be subject to disabling and such in the future
export function isLoaded(id) {
  return !!AppStore.get()[id];
}
