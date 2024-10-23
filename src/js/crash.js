import { KERNEL } from "../env.js";
import { Log, LogType } from "./logging.js";

export let CRASHING = false;

// Crash processes global errors & unhandled rejections to send the user to the crash screen
export function Crash(reason) {
  // Are we crashing?
  if (CRASHING) return; // yes; stop.

  // We sure are crashing now
  CRASHING = true;

  // Make note of the crash
  Log(`Crash`, `### ---![ WE ARE CRASHING! ]!--- ###`, LogType.critical);
  Log(
    `Crash`,
    reason.error ? reason.error.message : reason.reason.message,
    LogType.critical
  );

  // Get the currently loaded StateHandler
  const state = KERNEL.getModule("state");

  // Load the crash state
  state.loadState(state.store.crash, { reason }, true);
}
