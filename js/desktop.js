import { loadBuiltinApps } from "./apps/builtin.js";
import { ProcessHandler } from "./process/handler.js";
import { StateError } from "./state/error.js";
import { startUserDataSync, UserData } from "./user/data.js";

export let Stack;

export default async function render() {
  const stateLoader = document.querySelector("#stateLoader.desktop");

  if (!stateLoader)
    throw new StateError("Desktop render invocation outside StateLoader!");

  startUserDataSync();

  Stack = new ProcessHandler();

  await Stack._init("appRenderer");
  await loadBuiltinApps();

  UserData.subscribe((v) => {
    if (!v) return;

    stateLoader.setAttribute("data-theme", v.theme || "dark");
  });
}
