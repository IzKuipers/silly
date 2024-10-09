import { isLoaded } from "../apps/load.js";
import { spawnApp } from "../apps/spawn.js";
import { Log } from "../logging.js";

export function MessageBox(
  { title, message, icon, buttons },
  parentPid = undefined
) {
  if (!isLoaded("msgBox")) {
    Log(title, message);

    return;
  }

  spawnApp(`msgBox`, parentPid, { title, message, icon, buttons });
}
