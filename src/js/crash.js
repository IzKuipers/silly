import { KERNEL } from "../env.js";
import { Log, LogType } from "./logging.js";

export let CRASHING = false;

export function Crash(reason) {
  if (CRASHING) return;

  CRASHING = true;

  Log(`Crash`, `### ---![ WE ARE CRASHING! ]!--- ###`, LogType.critical);
  Log(
    `Crash`,
    reason.error ? reason.error.message : reason.reason.message,
    LogType.critical
  );

  KERNEL.state.loadState(KERNEL.state.store.crash, { reason }, true);
}
