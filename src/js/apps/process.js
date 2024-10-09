import { Log, LogType } from "../logging.js";
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
    this.app.meta = JSON.parse(JSON.stringify({ ...app.data }));
    this.app.id = app.data.id;

    this.name = app.data.id;
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

  async closeWindow() {
    const elements = [
      ...document.querySelectorAll(`div.window[data-pid="${this._pid}"]`),
      ...document.querySelectorAll(
        `button.opened-app[data-pid="${this._pid}"]`
      ),
    ];

    if (!elements.length) return this.killSelf();

    for (const element of elements) {
      element.classList.add("closing");
    }

    await Sleep(300);

    this.killSelf();
  }

  async CrashDetection() {
    while (true) {
      if (this.crashReason) {
        throw new AppRuntimeError(this.crashReason);
      }

      if (this._disposed) {
        throw new Error("Disposed");
      }

      await Sleep(1);
    }
  }

  safe(callback) {
    return (...args) => {
      try {
        if (this._disposed) return;

        callback(...args);
      } catch (e) {
        Log(`AppProcess::'${this._pid}'.safe`, e.message, LogType.error);

        this.crashReason = e.stack;
      }
    };
  }

  addEventListener(element, event, callback) {
    element.addEventListener(
      event,
      this.safe((e) => callback(e))
    );
  }

  render() {}
}
