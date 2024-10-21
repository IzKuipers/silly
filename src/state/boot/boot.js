import { KERNEL } from "../../env.js";
import { RegistryHives } from "../../js/registry/store.js";
import { Sleep } from "../../js/sleep.js";

export default async function render() {
  const status = document.querySelector("#stateLoader.boot-screen #status");
  const clone = KERNEL.getModule("clone");
  const registry = KERNEL.getModule("registry");

  if (clone.needsClone) {
    await clone.doClone((p) => {
      status.innerText = `Cloned ${p}`;
    });

    return;
  }

  if (!registry.getValue(RegistryHives.local, "initialSetup.completed")) {
    status.innerText = "Welcome to Inepta";
  }

  await Sleep(3000);

  KERNEL.state.loadState(KERNEL.state.store.login);
}
