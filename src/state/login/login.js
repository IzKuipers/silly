import { LoginApp } from "../../apps/loginapp/metadata.js";
import { KERNEL, RendererPid, VERSION } from "../../env.js";
import { loadApp } from "../../js/apps/load.js";
import { spawnApp } from "../../js/apps/spawn.js";
import { AppStore } from "../../js/apps/store.js";

export default async function render() {
  AppStore.set({});

  await loadApp(LoginApp);
  await spawnApp("loginApp", RendererPid.get(), "SYSTEM");

  const versionNumber = document.querySelector("#stateLoader.login #versionNumber");

  versionNumber.innerText = `Inepta v${VERSION.join(".")}-${KERNEL.BUILD}\n${
    Object.entries(KERNEL.state.store).length
  } States | ${KERNEL.modules.length} Kernel Modules`;
}
