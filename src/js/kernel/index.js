import { setKernel } from "../../env.js";
import { handleGlobalErrors } from "../error.js";
import { Log } from "../logging.js";
import { ProcessHandler } from "../process/handler.js";
import { StateHandler } from "../state/index.js";
import { VirtualFileSystem } from "../vfs.js";
import { InitProcess } from "./init.js";

export class IneptaKernel {
  fs;
  state;
  stack;
  params;

  constructor() {
    Log("KERNEL", "Starting kernel");

    handleGlobalErrors();

    setKernel(this);
  }

  async initializeCoreModules() {
    Log("KERNEL", `Initializing Core Modules`);

    this.fs = new VirtualFileSystem();
    this.state = new StateHandler();

    this.stack = new ProcessHandler();
  }

  getModule(id) {
    return this[id] && typeof this[id] === "object" ? this[id] : undefined;
  }

  loadUserModule(id, data) {
    Log("KERNEL", `Loading user module "${id}"`);

    if (!data || typeof data !== "object" || this[id])
      throw new Error("Attempted to load invalid Kernel Module");

    this[id] = data;
  }

  async _init() {
    Log("KERNEL", "Called _init");

    await this.initializeCoreModules();
    this.params = new URLSearchParams();

    const initPid = (await this.stack.spawn(InitProcess))._pid;

    await this.stack._init("appRenderer", initPid);
  }
}
