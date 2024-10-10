import { setKernel } from "../../env.js";
import { handleConsoleIntercepts } from "../error/console.js";
import { handleGlobalErrors } from "../error/global.js";
import { Log } from "../logging.js";
import { StateHandler } from "../state/index.js";
import { InitProcess } from "./init.js";
import { CoreKernelModules } from "./module/store.js";

export class IneptaKernel {
  fs;
  state;
  stack;
  params;
  initPid;

  constructor() {
    Log("KERNEL", "Starting kernel");

    handleGlobalErrors();
    handleConsoleIntercepts();

    setKernel(this);
  }

  async initializeCoreModules() {
    Log("KERNEL", `Initializing Core Modules`);

    for (const [id, mod] of Object.entries(CoreKernelModules)) {
      this[id] = new mod(this, id);

      await this[id].__init();
    }
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

    this.init = await this.stack.spawn(InitProcess);
    this.initPid = this.init._pid;

    this.state = await this.stack.spawn(StateHandler, this.initPid);

    this.init.jumpstart();

    await this.stack.startRenderer("appRenderer", this.initPid);
  }
}
