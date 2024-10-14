import { LoginApp } from "../../apps/loginapp/metadata.js";
import { KERNEL, VERSION } from "../../env.js";
import { loadApp } from "../../js/apps/load.js";
import { spawnApp } from "../../js/apps/spawn.js";
import { AppStore } from "../../js/apps/store.js";

export default async function render() {
  AppStore.set({});

  await loadApp(LoginApp);
  await spawnApp("loginApp");

  const versionNumber = document.querySelector(
    "#stateLoader.login #versionNumber"
  );

  versionNumber.innerText = `Inepta v${VERSION.join(".")}-unknown\n${
    Object.entries(KERNEL.state.store).length
  } states | ${KERNEL.modules.length} modules | started ${
    KERNEL.startMs
  } | init #${KERNEL.initPid}`;
}
