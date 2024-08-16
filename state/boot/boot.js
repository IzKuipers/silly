import { Sleep } from "../../js/sleep.js";
import { loadState, States } from "../../js/state/load.js";

export default async function render() {
  await Sleep(3000);

  loadState(States.login);
}
