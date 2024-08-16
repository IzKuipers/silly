import { loadBuiltinApps } from "./apps/builtin.js";
import { spawnApp } from "./apps/spawn.js";
import { ProcessHandler } from "./process/handler.js";
import { UserData } from "./user/data.js";

export let Stack;

export default async function render() {
  const stateLoader = document.querySelector("#stateLoader.desktop");

  if (!stateLoader)
    throw new Error("Desktop render invocation outside StateLoader!");

  Stack = new ProcessHandler();

  await Stack._init("appRenderer");
  await loadBuiltinApps();

  spawnApp("shell");

  UserData.subscribe((v) => {
    if (!v) return;

    stateLoader.setAttribute("data-theme", v.theme || "dark");
  });
}
