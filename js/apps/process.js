import { Process } from "../process/instance.js";

export class AppProcess extends Process {
  app;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.app = app;
  }

  getElement(querySelector) {
    return document.querySelector(
      `div.window[data-pid="${this._pid}"] > div.body ${querySelector}`
    );
  }

  render() {}
}
