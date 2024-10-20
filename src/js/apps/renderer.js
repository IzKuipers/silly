import { RendererPid } from "../../env.js";
import { MessageBox } from "../desktop/message.js";
import { AppIcons } from "../images/apps.js";
import { MessageIcons } from "../images/msgbox.js";
import { Draggable } from "../neodrag.js";
import { Process } from "../process/instance.js";
import { Sleep } from "../sleep.js";
import { Store } from "../store.js";
import { htmlspecialchars } from "../util.js";
import { AppRendererError } from "./error.js";

export class AppRenderer extends Process {
  currentState = [];
  target;
  maxZIndex = 1e6;
  focusedPid = Store(-1);

  constructor(handler, pid, parentPid, target) {
    super(handler, pid, parentPid);

    const targetDiv = document.getElementById(target);

    if (!targetDiv)
      throw new AppRendererError(
        "Tried to create an app renderer on a non existent element"
      );

    this.target = targetDiv;
    RendererPid.set(this._pid);
  }

  disposedCheck() {
    if (this._disposed) {
      throw new AppRendererError(
        `AppRenderer with PID ${this._pid} was killed`
      );
    }
  }

  sync() {
    this.disposedCheck();
    this.syncNewbies();
    this.syncDisposed();
  }

  syncNewbies() {
    this.disposedCheck();

    const appProcesses = [];

    for (const [_, proc] of [...this.handler.store.get()]) {
      if (proc.app && !proc._disposed) appProcesses.push(proc);
    }

    for (const process of appProcesses) {
      const presentInstances = this.currentState.filter(
        (p) => p == process._pid
      );

      if (!presentInstances.length && process.app) {
        this.currentState.push(process._pid);

        this.render(process);
      }
    }
  }

  syncDisposed() {
    this.disposedCheck();

    for (const pid of this.currentState) {
      const process = this.handler.getProcess(pid);

      if (process) continue;

      this.remove(pid);
    }
  }

  async render(process) {
    this.disposedCheck();

    if (process._disposed) return;

    const window = document.createElement("div");
    const titlebar = this._renderTitlebar(process);
    const body = document.createElement("div");
    const styling = document.createElement("link");

    const { app } = process;
    const { data } = app;

    styling.rel = "stylesheet";
    styling.href = data.files.css;
    styling.id = `$${process._pid}`;

    document.body.append(styling);

    await Sleep(100);

    await this._windowHtml(body, data);

    body.className = "body";

    window.className = "window";
    window.setAttribute("data-pid", process._pid);
    window.setAttribute("data-id", data.id);
    window.append(titlebar, body);
    window.classList.add(data.id);

    this._windowClasses(window, data);
    this._windowEvents(process._pid, window, titlebar, data);

    this.target.append(window);

    try {
      await process.render();
      this.focusPid(process._pid);
      await process.CrashDetection();
    } catch (e) {
      if (!process._disposed) {
        // if (true) {
        const lines = [
          `<b><code>${data.id}::'${data.metadata.name}'</code> (PID ${process._pid}) has encountered a problem and needs to close. I am sorry for the inconvenience.</b>`,
          `If you were in the middle of something, the information you were working on might be lost. You can choose to view the call stack, which may contain the reason for the crash.`,
          `<details><summary>Show call stack</summary><pre>${htmlspecialchars(
            e.stack.replaceAll(location.href, "")
          )}</pre></details>`,
        ];

        MessageBox({
          title: `${data.metadata.name} - Application Error`,
          message: lines.join("<br><br>"),
          buttons: [
            {
              caption: "Okay",
              action() {},
            },
          ],
          icon: MessageIcons.critical,
        });
      }

      await Sleep(0);
      await this.handler.kill(process._pid);
    }
  }

  _windowClasses(window, data) {
    this.disposedCheck();

    if (data.core) window.classList.add("core");
    else {
      window.style.maxWidth = `${data.maxSize.w}px`;
      window.style.maxHeight = `${data.maxSize.h}px`;
      window.style.minWidth = `${data.minSize.w}px`;
      window.style.minHeight = `${data.minSize.h}px`;
      window.style.width = `${data.size.w}px`;
      window.style.height = `${data.size.h}px`;

      if (data.position.centered) {
        const x =
          data.position.x || (document.body.offsetWidth - data.size.w) / 2;
        const y =
          data.position.y || (document.body.offsetHeight - data.size.h) / 2;

        window.style.top = `${y}px`;
        window.style.left = `${x}px`;
        window.style.transform = `translate3d(0px, 0px, 0px)`;
      } else if (`${data.position.x}` && `${data.position.y}`) {
        window.style.top = `${data.position.y}px`;
        window.style.left = `${data.position.x}px`;
      } else {
        throw new Error(`Attempted to create a window without valid position`);
      }

      if (data.state.resizable) window.classList.add("resizable");
    }
  }

  centerWindow(pid) {
    this.disposedCheck();

    const window = this.target.querySelector(`div.window[data-pid="${pid}"]`);

    if (!window) return;
    const x = (document.body.offsetWidth - window.offsetWidth) / 2;
    const y = (document.body.offsetHeight - window.offsetHeight) / 2;

    window.style.top = `${y}px`;
    window.style.left = `${x}px`;
  }

  _windowEvents(pid, window, titlebar, data) {
    this.disposedCheck();

    if (data.core) return; // Core applications don't need any fancy things

    new Draggable(window, {
      bounds: { top: 0, left: 0, right: 0 },
      handle: titlebar,
      cancel: `.controls`,
      legacyTranslate: false,
      gpuAcceleration: false,
    });

    window.addEventListener("mousedown", () => {
      this.focusPid(pid);
    });

    this.focusedPid.subscribe((v) => {
      window.classList.remove("focused");

      if (v === pid) window.classList.add("focused");
    });
  }

  focusPid(pid) {
    this.disposedCheck();

    const currentFocus = this.focusedPid.get();
    const window = document.querySelector(`div.window[data-pid="${pid}"]`);

    this.unMinimize(pid);

    if (!window || currentFocus === pid) return;

    this.maxZIndex++;
    window.style.zIndex = this.maxZIndex;

    this.focusedPid.set(pid);
  }

  async _windowHtml(body, data) {
    this.disposedCheck();

    try {
      const html = await (await fetch(data.files.html)).text();

      body.innerHTML = html;
    } catch {
      throw new AppRendererError(`Failed to get HTML of ${data.id}`);
    }
  }

  _renderTitlebar(process) {
    this.disposedCheck();

    if (process.app.data.core) return ""; // Again, core apps don't need a titlebar

    const titlebar = document.createElement("div");
    const title = document.createElement("div");
    const titleIcon = document.createElement("img");
    const titleCaption = document.createElement("span");
    const controls = document.createElement("div");

    controls.className = "controls";

    const { app } = process;
    const { data } = app;

    if (data.controls.minimize) {
      const minimize = document.createElement("button");

      minimize.className = "minimize material-symbols-outlined";
      minimize.innerText = "keyboard_arrow_down";
      minimize.addEventListener("click", () =>
        this.toggleMinimize(process._pid)
      );

      controls.append(minimize);
    }

    if (data.controls.maximize) {
      const maximize = document.createElement("button");

      maximize.className = "maximize material-symbols-outlined";
      maximize.innerText = "keyboard_arrow_up";
      maximize.addEventListener("click", () =>
        this.toggleMaximize(process._pid)
      );

      controls.append(maximize);
    }

    if (data.controls.close) {
      const close = document.createElement("button");

      close.className = "close material-symbols-outlined";
      close.innerText = "close";
      close.addEventListener("click", async () => {
        process.closeWindow();
      });

      titlebar.append(close);
    }

    // TODO: app icons and window specific icons; inject into titlebar here.

    titleCaption.innerText = `${data.metadata.name}`;
    titleIcon.src = data.metadata.icon || AppIcons.default;

    process.windowTitle.subscribe((v) => {
      titleCaption.innerText = v;
    });

    process.contextMenu(titlebar, () => [
      {
        caption: data.metadata.name,
        disabled: true,
        action: () => {},
        separator: true,
      },
      {
        caption: "Minimize",
        disabled: !data.controls.minimize,
        action: () => {
          this.toggleMinimize(process._pid);
        },
      },
      {
        caption: "Maximize",
        disabled: !data.controls.maximize,
        action: () => {
          this.toggleMaximize(process._pid);
        },
      },
      {
        caption: "Close",
        disabled: !data.controls.close,
        action: () => {
          process.closeWindow();
        },
      },
    ]);

    title.className = "window-title";
    title.append(titleIcon, titleCaption);

    titlebar.className = "titlebar";
    titlebar.append(title, controls);

    return titlebar;
  }

  async remove(pid) {
    this.disposedCheck();

    if (!pid) return;

    const window = this.target.querySelector(`div.window[data-pid="${pid}"]`);
    const styling = document.body.querySelector(`link[id="$${pid}"`);

    if (window) window.remove();
    if (styling) styling.remove();
  }

  toggleMaximize(pid) {
    this.disposedCheck();

    const window = this.target.querySelector(`div.window[data-pid="${pid}"]`);

    if (!window) return;

    window.classList.toggle("maximized");

    const process = this.handler.getProcess(+pid);

    if (!process || !process.app) return;

    process.app.data.state.maximized = window.classList.contains("maximized");
  }

  unMinimize(pid) {
    this.disposedCheck();

    const window = this.target.querySelector(`div.window[data-pid="${pid}"]`);

    if (!window) return;

    window.classList.remove("minimized");

    const process = this.handler.getProcess(+pid);

    if (!process || !process.app) return;

    process.app.data.state.minimized = false;
  }

  toggleMinimize(pid) {
    this.disposedCheck();

    const window = this.target.querySelector(`div.window[data-pid="${pid}"]`);

    if (!window) return;

    window.classList.toggle("minimized");

    const process = this.handler.getProcess(+pid);

    if (!process || !process.app) return;

    process.app.data.state.minimized = window.classList.contains("minimized");
  }

  getAppInstances(id, origin = undefined) {
    const result = [];

    for (const pid of this.currentState) {
      if (pid === origin) continue;

      const proc = this.handler.getProcess(pid);

      if (proc && proc.app && proc.app.data && proc.app.data.id === id)
        result.push(id);
    }

    return result;
  }
}
