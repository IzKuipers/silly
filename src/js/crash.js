import { Log } from "./logging.js";
import { loadState, States } from "./state/load.js";

export let CRASHING = false;

export function Crash(reason) {
  if (CRASHING) return;

  CRASHING = true;

  Log(`Crash`, `### ---![ WE ARE CRASHING! ]!--- ###`);
  Log(`Crash`, reason.error ? reason.error.message : reason.reason.message);

  loadState(States.crash, { reason }, true);
}
