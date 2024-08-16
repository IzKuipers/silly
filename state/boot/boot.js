import { Sleep } from "../../js/sleep.js";
import { loadStateCode } from "../../js/state/exec.js";
import { loadState, States } from "../../js/state/load.js";

loadStateCode(async function render() {
  await Sleep(3000);

  loadState(States.login);
}, States.boot);
