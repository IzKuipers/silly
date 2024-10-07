export class Process {
  _pid;
  _disposed = false;
  _criticalProcess = false;
  handler;
  parentPid = undefined;
  name = "";

  constructor(handler, pid, parentPid = undefined) {
    this._pid = pid;
    this._disposed = false;
    this.parentPid = parentPid;
    this.handler = handler;
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
