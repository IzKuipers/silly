import { spawnApp } from "../apps/spawn.js";

export function MessageBox({ title, message, icon, buttons }) {
  spawnApp(`msgBox`, undefined, { title, message, icon, buttons });
}
