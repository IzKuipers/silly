import { RendererPid } from "../../env.js";
import { Stack } from "../desktop.js";
import { AppLoadError } from "./error.js";
import { AppStore } from "./store.js";

export async function spawnApp(id, parent = undefined, ...args) {
  const app = { ...AppStore.get()[id] };

  const rendererPid = RendererPid.get();

  if (!parent && rendererPid) parent = rendererPid;

  if (!Stack) throw new AppLoadError(`Tried to spawn an app without a handler`);

  if (!app) {
    // TODO: proper UI for this too
    console.error(`No such app ${id}`);

    return false;
  }

  app.data = JSON.parse(JSON.stringify(app.data));

  return (await Stack.spawn(app.process, parent, app, ...args)) === "success";
}
