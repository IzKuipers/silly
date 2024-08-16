import { Stack } from "../desktop.js";
import { AppStore } from "./store.js";

export async function spawnApp(id, parent = undefined, ...args) {
  const app = AppStore[id];

  if (!app || !Stack) throw new Error(`No such app ${id} or no stack`);

  await Stack.spawn(app.process, parent, app, ...args);
}
