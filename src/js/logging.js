import { KERNEL } from "../env.js";

export const LogStore = [];
export const LogType = {
  0: "INFO",
  1: "WARN",
  2: "ERRR",
  3: "CRIT",
  info: 0,
  warning: 1,
  error: 2,
  critical: 3,
};

export function Log(source, message, type = 0) {
  if (!KERNEL) return;

  KERNEL.Log(source, message, type);
}
