import { Log } from "../logging.js";
import { StateCodeExecution } from "./store.js";

export function loadStateCode(cb, state) {
  if (!state || !state.identifier)
    throw new Error("Tried to load state code for invalid state");

  Log("loadStateCode", `Received execution for ${state.identifier}`);

  StateCodeExecution[state.identifier] = cb;
}
