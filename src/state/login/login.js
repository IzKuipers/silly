import { LoginApp } from "../../apps/loginapp/metadata.js";
import { loadApp } from "../../js/apps/load.js";
import { spawnApp } from "../../js/apps/spawn.js";

export default async function render() {
  await loadApp(LoginApp);

  await spawnApp("loginApp");
}
