import { AppRenderer } from "../apps/renderer.js";
import { Log } from "../logging.js";

export class ProcessHandler {
  store = new Map([]);
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

    this.store.set(pid, proc);

    if (this.renderer) this.renderer.sync();

    return proc;
  }

  async kill(pid) {
    Log("ProcessHandler.kill", `Attempting to kill ${pid}`);

    const proc = this.store.get(pid);

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

    for (const [pid, proc] of this.store) {
      if (proc.parentPid != pPid) continue;

      result.set(pid, proc);
    }

    return result;
  }

  getProcess(pid) {
    const proc = this.store.get(pid);

    if (!proc) return undefined;

    return proc._disposed ? undefined : proc;
  }

  getPid() {
    const pid = Math.floor(Math.random() * 1e4);

    if (this.store.get(pid)) return this.getPid(); // Avoid duplicates

    return pid;
  }

  isPid(pid) {
    return this.store.has(pid) && !this.store.get(pid)._disposed;
  }
}
