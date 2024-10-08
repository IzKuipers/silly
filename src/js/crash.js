import { KERNEL } from "../env.js";
import { Log } from "./logging.js";

export let CRASHING = false;

export function Crash(reason) {
  if (CRASHING) return;

  CRASHING = true;

  Log(`Crash`, `### ---![ WE ARE CRASHING! ]!--- ###`);
  Log(`Crash`, reason.error ? reason.error.message : reason.reason.message);

  KERNEL.state.loadState(KERNEL.state.store.crash, { reason }, true);
}
