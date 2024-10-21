import { Log, LogType } from "../logging.js";
import { Process } from "../process/instance.js";
import { Sleep } from "../sleep.js";
import { Store } from "../store.js";
import { AppRuntimeError } from "./error.js";
import { spawnAppExternal } from "./spawn.js";

export class AppProcess extends Process {
  crashReason = "";
  app;
  windowTitle = Store("");
  children = {};

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.app = app;
    this.app.data = JSON.parse(JSON.stringify({ ...app.data }));
    this.app.meta = JSON.parse(JSON.stringify({ ...app.data }));
    this.app.id = app.data.id;
    this.windowTitle.set(app.data.metadata.name);
    this.name = app.data.id;

    this.assignDispatchSubscribers();
  }

  async start() {
    await this.registerChildren();
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

  getElements(querySelector, error = false) {
    const element = document.querySelectorAll(
      `div.window[data-pid="${this._pid}"] > div.body ${querySelector}`
    );

    if (error && !element.length) {
      throw new AppRuntimeError(
        `${this._pid}: No such elements ${querySelector}`
      );
    }

    return element;
  }

  async closeWindow() {
    const elements = [
      ...document.querySelectorAll(`div.window[data-pid="${this._pid}"]`),
      ...(document.querySelectorAll(
        `button.opened-app[data-pid="${this._pid}"]`
      ) || []),
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

  getSingleInstanceLock() {
    const { renderer } = this.handler;

    const instances = renderer.getAppInstances(this.app.data.id, this._pid);

    return !instances.length;
  }

  closeIfSecondInstance() {
    const hasLock = this.getSingleInstanceLock();

    if (!hasLock) this.killSelf();
  }

  assignDispatchSubscribers() {
    this.dispatch.subscribe(
      "close-window",
      this.safe(() => {
        this.closeWindow();
      })
    );

    this.dispatch.subscribe(
      "close-second-instance",
      this.safe(() => {
        this.closeIfSecondInstance();
      })
    );

    this.dispatch.subscribe(
      "panic-button",
      this.safe(() => {
        throw new Error("Panic!");
      })
    );
  }

  async registerChildren() {
    Log(
      `AppProcess::'${this._pid}'.registerChildren`,
      `Locating and loading contents of app.data.children`
    );

    const children = this.app.data.children;

    if (!children) return;

    for (const childMetaPath of children) {
      Log(
        `AppProcess::'${this._pid}'.registerChildren`,
        `Attempting import of ${childMetaPath}`
      );

      try {
        const { default: meta } = await import(childMetaPath);

        if (!meta) continue;

        this.children[meta.id] = meta;
      } catch {
        Log(
          `AppProcess::'${this._pid}'.registerChildren`,
          `Attempting import of ${childMetaPath} failed!`,
          LogType.error
        );

        continue;
      }
    }
  }

  async spawnChild(id, ...args) {
    const child = this.children[id];

    if (!child) return false;

    await spawnAppExternal(child, this._pid, ...args);
  }

  contextMenu(element, optionsCallback) {
    element.addEventListener("contextmenu", (e) => {
      this.context.showMenu(e.clientX, e.clientY, optionsCallback());
    });
  }
}
