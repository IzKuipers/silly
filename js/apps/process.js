import { Process } from "../process/instance.js";
import { AppRuntimeError } from "./error.js";

export class AppProcess extends Process {
  app;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.app = app;
  }

  getElement(querySelector, error = false) {
    const element = document.querySelector(
      `div.window[data-pid="${this._pid}"] > div.body ${querySelector}`
    );

    if (error && !element) {
      throw new AppRuntimeError(
        `${this._pid}: No such element ${querySelector}`
      );
    }

    return element;
  }

  render() {}
}
