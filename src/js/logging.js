import { KERNEL } from "../env.js";

export const LogStore = []; // The session's log store
export const LogType = {
  0: "INFO",
  1: "WARN",
  2: "ERRR",
  3: "CRIT",
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
}; // The different log types (JS equivalent of a TS enum)

// Global function for logging
export function Log(source, message, type = 0) {
  if (!KERNEL) return; // No kernel? No log.

  // Send the log data to the kernel
  KERNEL.Log(source, message, type);
}
