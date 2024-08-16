import { Log } from "./logging.js";
import { loadState, States } from "./state/load.js";

export function Crash(reason) {
  Log(`Crash`, `### ---![ WE ARE CRASHING! ]!--- ###`);
  loadState(States.crash, { reason });
}
