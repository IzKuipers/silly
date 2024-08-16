import { Process } from "../process/instance.js";

export class AppProcess extends Process {
  app;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.app = app;
  }

  getElement(querySelector) {
    document.querySelector(
      `.window[data-pid="${this._pid}"][data-id="${this.app.id}"] > div.body ${querySelector}`
    );
  }

  render() {}
}
