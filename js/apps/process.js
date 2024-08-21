import { Process } from "../process/instance.js";
import { Sleep } from "../sleep.js";
import { AppRuntimeError } from "./error.js";

export class AppProcess extends Process {
  crashReason = "";
  app;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.app = app;
    this.app.data = JSON.parse(JSON.stringify({ ...app.data }));
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

  async CrashDetection() {
    while (true) {
      if (this.crashReason) {
        throw new AppRuntimeError(this.crashReason);
      }

      await Sleep(1);
    }
  }

  safeCallback(callback) {
    return (...args) => {
      try {
        callback(...args);
      } catch (e) {
        console.log(e);
        this.crashReason = e.stack;
      }
    };
  }

  addEventListener(element, event, callback) {
    element.addEventListener(
      event,
      this.safeCallback((e) => callback(e))
    );
  }

  render() {}
}
