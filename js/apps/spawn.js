import { Stack } from "../desktop.js";
import { AppLoadError } from "./error.js";
import { AppStore } from "./store.js";

export async function spawnApp(id, parent = undefined, ...args) {
  const app = AppStore[id];

  if (!app || !Stack) throw new AppLoadError(`No such app ${id} or no stack`);

  await Stack.spawn(app.process, parent, app, ...args);
}
