import { KERNEL } from "../../env.js";
import { ProcessDispatch } from "./dispatch.js";

export class Process {
  _pid;
  _disposed = false;
  _criticalProcess = false;
  handler;
  dispatch;
  parentPid = undefined;
  name = "";

  constructor(handler, pid, parentPid = undefined) {
    this._pid = pid;
    this._disposed = false;
    this.parentPid = parentPid;
    this.handler = handler;
    this.kernel = KERNEL;
    this.registry = KERNEL.getModule("registry");
    this.environment = KERNEL.getModule("environment");
    this.dispatch = new ProcessDispatch(this);

    this.name ||= this.constructor.name;

    this.dispatch.subscribe("kill-self", () => {
      this.killSelf();
    });
  }

  async killSelf() {
    await this.handler.kill(this._pid);
  }

  async stop() {
    // ! DUMMY
  }

  async start() {
    // ! DUMMY
  }
}
