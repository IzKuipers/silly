import { KERNEL } from "../../env.js";
import { LogStore, LogType } from "../../js/logging.js";
import { Sleep } from "../../js/sleep.js";
import { getStateProps } from "../../js/state/store.js";
export default async function render() {
  const crashText = document.getElementById("crashText");

  if (!crashText) return;

  const stateLoader = document.querySelector("div#stateLoader");
  const appRenderer = document.querySelector("div#appRenderer");

  appRenderer.remove();

  const { reason } = getStateProps(KERNEL.state.store.crash);
  const str = `**** INEPTA EXCEPTION ****\n\nAn error has occured, and Inepta has been halted.\nDetails of the error and the system log can be found below.\nNewest log entry is at the top.\n\nIf this keeps happening, try unloading any sideloaded applications.\n\n`;

  crashText.innerText = str;
  crashText.innerText += reason.error
    ? reason.error.stack
    : reason.reason.stack;

  crashText.innerText = crashText.innerText.replaceAll(location.href, "./");

  await Sleep(0);

  crashText.innerText += `\n\n${LogStore.map(
    ({ type, kernelTime, source, message }) =>
      `[${kernelTime.toString().padStart(8, "0")}] ${
        LogType[type]
      } ${source}: ${message}`
  )
    .reverse()
    .join("\n")}`;
}
