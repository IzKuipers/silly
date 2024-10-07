import { spawnApp } from "../apps/spawn.js";

export function MessageBox(
  { title, message, icon, buttons },
  parentPid = undefined
) {
  spawnApp(`msgBox`, parentPid, { title, message, icon, buttons });
}
