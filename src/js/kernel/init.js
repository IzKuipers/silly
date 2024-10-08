import { KERNEL } from "../../env.js";
import { Crash } from "../crash.js";
import { Process } from "../process/instance.js";

export class InitProcess extends Process {
  constructor(handler, pid, parentPid) {
    super(handler, pid, parentPid);
  }

  start() {
    KERNEL.state.loadState(
      KERNEL.state.store[KERNEL.params.get("state") || "boot"],
      {},
      false
    );
  }
}
