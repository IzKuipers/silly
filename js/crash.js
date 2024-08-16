import { Log } from "./logging.js";
import { loadState, States } from "./state/load.js";

export function Crash(reason) {
  Log(`Crash`, `### ---![ WE ARE CRASHING! ]!--- ###`);
  Log(`Crash`, reason.error ? reason.error.message : reason.reason.message);
  loadState(States.crash, { reason });
}
