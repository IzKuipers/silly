import { AppRenderer } from "../apps/renderer.js";
import { Log } from "../logging.js";
import { Store } from "../store.js";

export class ProcessHandler {
  store = Store(new Map([]));
  renderer;

  constructor() {
    Log("ProcessHandler.constructor", "Constructing");
  }

  async _init(renderTarget) {
    this.renderer = await this.spawn(AppRenderer, undefined, renderTarget);
  }

  /**
   * @param {import("./instance.js").Process} process
   * @param {any[]} args
   */
  async spawn(process, parentPid = undefined, ...args) {
    const pid = this.getPid();
    const proc = new process(this, pid, parentPid, ...args);

    Log("ProcessHandler.spawn", `Spawning new process with ID ${pid}`);

    if (proc.start) await proc.start();

    const store = this.store.get();

    store.set(pid, proc);

    this.store.set(store);

    if (this.renderer) this.renderer.sync();

    return proc;
  }

  async kill(pid) {
    Log("ProcessHandler.kill", `Attempting to kill ${pid}`);

    const proc = this.store.get().get(pid);

    if (!proc) return "err_noExist";
    if (proc._criticalProcess) return "err_criticalProcess";

    if (proc.stop) await proc.stop();

    await this._killSubProcesses(pid);

    proc._disposed = true;

    this.renderer.sync();

    return "success";
  }

  async _killSubProcesses(pid) {
    const procs = this.getSubProcesses(pid);

    if (!procs.size) return;

    for (const [pid, proc] of procs) {
      if (proc._disposed) continue;

      await this.kill(pid, true);
    }
  }

  getSubProcesses(pPid) {
    const result = new Map([]);

    if (!this.isPid(pPid)) return result;

    for (const [pid, proc] of this.store.get()) {
      if (proc.parentPid != pPid) continue;

      result.set(pid, proc);
    }

    return result;
  }

  getProcess(pid) {
    const proc = this.store.get().get(pid);

    if (!proc) return undefined;

    return proc._disposed ? undefined : proc;
  }

  getPid() {
    const pid = Math.floor(Math.random() * 1e4);

    if (this.store.get().get(pid)) return this.getPid(); // Avoid duplicates

    return pid;
  }

  isPid(pid) {
    return this.store.get().has(pid) && !this.store.get().get(pid)._disposed;
  }
}
