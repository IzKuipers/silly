import { loadBuiltinApps } from "./apps/builtin.js";

export default async function render() {
  await loadBuiltinApps();
}
