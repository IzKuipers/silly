import { KERNEL } from "../../env.js";
import { Sleep } from "../../js/sleep.js";

export default async function render() {
  await Sleep(3000);
  KERNEL.state.loadState(KERNEL.state.store.login);
}
