import { KERNEL } from "../env.js";
import { loadBuiltinApps } from "./apps/builtin.js";
import { spawnApp } from "./apps/spawn.js";
import { Sleep } from "./sleep.js";
import { StateError } from "./state/error.js";
import { startUserDataSync, UserData } from "./user/data.js";

export default async function render() {
  const stateLoader = document.querySelector("#stateLoader.desktop");

  if (!stateLoader)
    throw new StateError("Desktop render invocation outside StateLoader!");

  startUserDataSync();
  await loadBuiltinApps();

  UserData.subscribe((v) => {
    if (!v) return;

    stateLoader.setAttribute("data-theme", v.theme || "dark");
  });

  window.rcss = async () => {
    const links = document.querySelectorAll(`link[rel="stylesheet"]`);

    for (const link of links) {
      const href = `${link.href}`;

      link.href = "";
      await Sleep(100);
      link.href = href;
    }
  };

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "f8") {
      e.preventDefault();
      window.rcss();
    }
  });

  window.kernel = KERNEL;
  window.spawnApp = spawnApp;
}
