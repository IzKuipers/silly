import { handleGlobalErrors } from "./error.js";
import { Log } from "./logging.js";
import { loadState, States } from "./state/load.js";

export * from "./state/load.js";

export function Init() {
  Log("Init", "*** STARTING INEPTA ***");

  handleGlobalErrors();

  const params = new URLSearchParams(location.search);

  loadState(States[params.get("state") || "boot"]);
}

Init();
