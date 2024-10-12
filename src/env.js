import { Store } from "./js/store.js";

export const VERSION = [1, 0, 0];
export const RendererPid = Store(-1);
export let KERNEL;

export function setKernel(kernel) {
  window.kernel = kernel;
  KERNEL = kernel;
}
