import { Log } from "../logging.js";
import { Process } from "../process/instance.js";
import { Sleep } from "../sleep.js";

export class AppRenderer extends Process {
  currentState = [];
  target;

  constructor(handler, pid, parentPid, target) {
    super(handler, pid, parentPid);

    const targetDiv = document.getElementById(target);

    console.log(target);

    if (!targetDiv)
      throw new Error(
        "Tried to create an app renderer on a non existent element"
      );

    this.target = targetDiv;
  }

  sync() {
    Log("AppRenderer.sync", "syncing");
    this.syncNewbies();
    this.syncDisposed();
  }

  syncNewbies() {
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
    for (const pid of this.currentState) {
      const process = this.handler.getProcess(pid);

      console.log(process);

      if (process) continue;

      this.remove(pid);
    }
  }

  async render(process) {
    const window = document.createElement("div");
    const titlebar = this._renderTitlebar(process);
    const body = document.createElement("div");
    const styling = document.createElement("link");

    const { app } = process;
    const { data } = app;

    try {
      const html = await (await fetch(data.files.html)).text();

      body.innerHTML = html;
    } catch {
      throw new Error(`Failed to get HTML of ${data.id}`);
    }

    styling.rel = "stylesheet";
    styling.href = data.files.css;
    styling.id = `$${process._pid}`;

    window.append(styling);

    await Sleep(100);

    body.className = "body";

    window.className = "window";
    window.setAttribute("data-pid", process._pid);
    window.setAttribute("data-id", data.id);
    window.append(titlebar, body);
    window.classList.add(data.id);

    if (data.core) window.classList.add("core");
    else {
      window.style.maxWidth = `${data.maxSize.w}px`;
      window.style.maxHeight = `${data.maxSize.h}px`;
      window.style.minWidth = `${data.minSize.w}px`;
      window.style.minHeight = `${data.minSize.h}px`;
      window.style.width = `${data.size.w}px`;
      window.style.height = `${data.size.h}px`;
      window.style.top = `${data.position.y}px`;
      window.style.left = `${data.position.x}px`;
    }

    this.target.append(window);

    await process.render();
  }

  _renderTitlebar(process) {
    if (process.app.data.core) return "";
    const titlebar = document.createElement("div");
    const title = document.createElement("div");
    const controls = document.createElement("div");

    const { app } = process;
    const { data } = app;

    if (data.controls.minimize) {
      const minimize = document.createElement("button");

      minimize.innerText = "mi";
      minimize.className = "minimize";

      controls.append(minimize);
    }

    if (data.controls.maximize) {
      const maximize = document.createElement("button");

      maximize.innerText = "ma";
      maximize.className = "maximize";

      controls.append(maximize);
    }

    if (data.controls.close) {
      const close = document.createElement("button");

      close.innerText = "cl";
      close.className = "close";

      close.addEventListener("click", async () => {
        console.log(await this.handler.kill(process._pid));
      });

      controls.append(close);
    }

    title.innerText = `[${process._pid}] ${data.metadata.name} (${data.metadata.version})`;
    title.className = "window-title";

    titlebar.className = "titlebar";
    titlebar.append(title, controls);

    return titlebar;
  }

  async remove(pid) {
    if (!pid) return;

    const window = this.target.querySelector(`div.window[data-pid="${pid}"]`);

    if (!window) return;

    window.remove();
  }
}
