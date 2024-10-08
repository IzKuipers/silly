import { Store } from "./js/store.js";

export const VERSION = [1, 0, 0];
export const PREFERENCES_FILE = "preferences.json";
export const RendererPid = Store(-1);
export let KERNEL;

export function setKernel(kernel) {
  KERNEL = kernel;
}
