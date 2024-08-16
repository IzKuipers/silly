import { handleGlobalErrors } from "./error.js";
import { Log } from "./logging.js";
import { loadState, States } from "./state/load.js";

export * from "./state/load.js";

export function Init() {
  Log("Init", "*** SILLY GOOF ***");

  handleGlobalErrors();

  loadState(States.boot);
}

Init();
