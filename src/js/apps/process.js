import { Log, LogType } from "../logging.js";
import { Process } from "../process/instance.js";
import { Sleep } from "../sleep.js";
import { Store } from "../store.js";
import { AppRuntimeError } from "./error.js";
import { spawnAppExternal } from "./spawn.js";

// The AppProcess class: the very class that apps are built from
export class AppProcess extends Process {
  // Reason for a potential crash
  crashReason = "";
  // { app, AppProcess }
  app;
  // Store to get/set the Window Title (used by the renderer)
  windowTitle = Store("");
  // Any child apps from app.data.children
  children = {};

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    // Initialize base variables
    this.app = app;
    this.app.data = JSON.parse(JSON.stringify({ ...app.data }));
    this.app.meta = JSON.parse(JSON.stringify({ ...app.data }));
    this.app.id = app.data.id;
    this.windowTitle.set(app.data.metadata.name);
    this.name = app.data.id;

    // Assign the base dispatch subscribers for an app
    this.assignDispatchSubscribers();
  }

  async start() {
    // Register app children when the process (not the app) starts
    await this.registerChildren();
  }

  // Utility function for getting an element in the scope of the app's HTML
  getElement(querySelector, error = false) {
    const element = document.querySelector(`div.window[data-pid="${this._pid}"] > div.body ${querySelector}`);

    if (error && !element) {
      throw new AppRuntimeError(`${this._pid}: No such element ${querySelector}`);
    }

    return element;
  }

  // Utility function for getting elements in the scope of the app's HTML
  getElements(querySelector, error = false) {
    const element = document.querySelectorAll(`div.window[data-pid="${this._pid}"] > div.body ${querySelector}`);

    if (error && !element.length) {
      throw new AppRuntimeError(`${this._pid}: No such elements ${querySelector}`);
    }

    return element;
  }

  // Conditional function that can prohibit closing if it returns false
  async onClose() {
    return true;
  }

  // Function to gracefully close the app window and then kill the process
  async closeWindow() {
    // Can the window close?
    const canClose = this._disposed || (await this.onClose());

    // Nope; stop.
    if (!canClose) return;

    // Get the window and the taskbar button of the window
    const elements = [...document.querySelectorAll(`div.window[data-pid="${this._pid}"]`), ...(document.querySelectorAll(`button.opened-app[data-pid="${this._pid}"]`) || [])];

    // No window and no taskbar button? Kill.
    if (!elements.length) return this.killSelf();

    // Add the closing class to each located element
    for (const element of elements) {
      element.classList.add("closing");
    }

    // Wait 300ms for the window close animation to finish
    await Sleep(300);

    // Kill.
    this.killSelf();
  }

  /**
   * Function for handling errors within the application:
   *
   * This function constantly monitors the `crashReason` variable. If it changes, an exception is thrown with the reason as
   * its message. This will then be picked up by the AppRenderer, which handles the crash dialog (provided the app isn't disposed).
   *
   * This method only works effectively if EVERY callback within the app's process is wrapped in the `this.safe()` function
   * found in this AppProcess class.
   */
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

  /**
   * Wrapper function for safely handling errors thrown because of callbacks
   *
   * This works by setting the `crashReason` variable if an exception occurs during the code execution of the provided callback.
   * This ensures that the app crashes, not Inepta entirely. It's also why every callback has to be wrapped in this function, for example:
   *
   * button.addEventListener("click", this.safe(async () => {
   *   await someOperationThatMightErrorSomehow();
   * }))
   */
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

  // Helper function that adds an event to an element, making it safe in the process
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
    Log(`AppProcess::'${this._pid}'.registerChildren`, `Locating and loading contents of app.data.children`);

    const children = this.app.data.children;

    if (!children) return;

    for (const childMetaPath of children) {
      Log(`AppProcess::'${this._pid}'.registerChildren`, `Attempting import of ${childMetaPath}`);

      try {
        const { default: meta } = await import(childMetaPath);

        if (!meta) continue;

        this.children[meta.id] = meta;
      } catch {
        Log(`AppProcess::'${this._pid}'.registerChildren`, `Attempting import of ${childMetaPath} failed!`, LogType.error);

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
    element.addEventListener(
      "contextmenu",
      this.safe(async (e) => {
        this.context.showMenu(e.clientX, e.clientY, await optionsCallback());
      })
    );
  }

  clickMenu(element, optionsCallback) {
    element.addEventListener(
      "click",
      this.safe(async (e) => {
        const { x, y: clientY, height } = e.target.getBoundingClientRect();
        const y = clientY + height + 2;

        this.context.showMenu(x, y, await optionsCallback());
      })
    );
  }
}
