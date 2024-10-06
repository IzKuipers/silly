import { getStateProps, States } from "../../js/init.js";
import { LogStore } from "../../js/logging.js";

export default async function render() {
  const crashText = document.getElementById("crashText");

  if (!crashText) return;

  const { reason } = getStateProps(States.crash);
  const str = `**** INEPTA EXCEPTION ****\n\nAn error has occured, and Inepta has been halted.\nDetails of the error can be found below.\n\nIf this keeps happening, try unloading any sideloaded applications.\n\n`;

  crashText.innerText = str;
  crashText.innerText += reason.error
    ? reason.error.stack
    : reason.reason.stack;

  crashText.innerText = crashText.innerText.replaceAll(location.href, "./");

  setTimeout(async () => {
    crashText.innerText += `\n\n${LogStore.reverse().join("\n")}`;
  });
}
