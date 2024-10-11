import { KERNEL } from "../../env.js";
import { Process } from "../process/instance.js";

export class InitProcess extends Process {
  constructor(handler, pid, parentPid) {
    super(handler, pid, parentPid);
  }

  stop() {
    throw new Error("Attempted to kill init!");
  }

  jumpstart() {
    // USER SPACE STARTS HERE
    KERNEL.state.loadState(
      KERNEL.state.store[KERNEL.params.get("state") || "boot"],
      {},
      false
    );
  }
}
