import { getStateProps, States } from "../../js/init.js";
import { LogStore } from "../../js/logging.js";

export default async function render() {
  const crashText = document.getElementById("crashText");

  if (!crashText) return;

  const { reason } = getStateProps(States.crash);

  const str = `**** UNCAUGHT EXCEPTION ****\n\nAn error has occured, and code execution has been halted.\nDetails of the error can be found below:\n\n`;

  crashText.innerText = str;
  crashText.innerText += reason.error
    ? reason.error.stack
    : reason.reason.stack;

  crashText.innerText = crashText.innerText.replaceAll(location.href, "/");

  setTimeout(() => {
    crashText.innerText += `\n\n${LogStore.reverse().join("\n")}`;
  });
}
