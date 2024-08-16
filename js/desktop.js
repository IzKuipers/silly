import { loadBuiltinApps } from "./apps/builtin.js";
import { spawnApp } from "./apps/spawn.js";
import { ProcessHandler } from "./process/handler.js";

export let Stack;

export default async function render() {
  Stack = new ProcessHandler();

  await Stack._init("appRenderer");
  await loadBuiltinApps();

  const shellSpawn = document.getElementById("shellSpawn");

  shellSpawn.addEventListener("click", () => {
    spawnApp("shell");
  });

  spawnApp("shell");
}
