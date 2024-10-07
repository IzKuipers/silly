import { AppRuntimeError } from "../../js/apps/error.js";
import { AppProcess } from "../../js/apps/process.js";
import { spawnApp } from "../../js/apps/spawn.js";
import { AppStore } from "../../js/apps/store.js";
import { strftime } from "../../js/desktop/date.js";
import { Store } from "../../js/store.js";
import { UserData } from "../../js/user/data.js";

export default class ShellProcess extends AppProcess {
  startOpened = Store(false);
  startPopulated = false;
  userData;
  usernameField;
  shutdownButton;
  startButton;
  startMenu;
  appList;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  render() {
    this.userData = UserData.get();
    this.usernameField = this.getElement("#startMenu #username", true);
    this.shutdownButton = this.getElement("#startMenu #shutdown", true);
    this.startButton = this.getElement("#startButton", true);
    this.startMenu = this.getElement("#startMenu", true);
    this.appList = this.getElement("#appList", true);

    this.startActiveAppsPopulator();
    this.startOutsideTrigger();
    this.startClock();
    this.initializeStartMenu();

    AppStore.subscribe((v) => {
      if (!v) return;

      this.populateAppList();
    });

    this.handler.renderer.focusedPid.subscribe(
      this.safeCallback((v) => {
        this.updateActiveAppsFocus(v);
      })
    );
  }

  stop() {}

  startActiveAppsPopulator() {
    const activeApps = this.getElement("#activeApps");

    if (!activeApps)
      throw new AppRuntimeError("Failed to find #activeApps div");

    const populate = this.safeCallback((v = this.handler.store.get()) => {
      activeApps.innerHTML = "";

      for (const [pid, proc] of [...v]) {
        if (!proc.app || proc.app.data.core || proc._disposed) continue;

        const button = document.createElement("button");

        button.setAttribute("data-pid", pid);
        button.className = `${proc.app.data.id} opened-app`;
        button.innerText = proc.app.data.metadata.name;

        button.addEventListener(
          "click",
          this.safeCallback(() => {
            this.handler.renderer.focusPid(pid);
          })
        );

        activeApps.append(button);
      }
    });

    this.handler.store.subscribe(populate);
  }

  updateActiveAppsFocus(focusedPid = this.handler.renderer.focusedPid.get()) {
    const activeApps = this.getElement("#activeApps");

    if (!activeApps)
      throw new AppRuntimeError("Failed to find #activeApps div");

    for (const button of activeApps.children) {
      const pid = button.getAttribute("data-pid");

      button.classList.remove("focused", "minimized");
      if (parseInt(pid) === focusedPid) button.classList.add("focused");

      const process = this.handler.getProcess(+pid);

      if (process && process.app && process.app.data.state.minimized) {
        button.classList.add("minimized");
      }
    }
  }

  populateAppList() {
    const appList = this.appList;
    const apps = AppStore.get();

    this.appList.innerHTML = "";

    for (const [id, app] of Object.entries(apps)) {
      if (!app || !app.data || app.data.hidden || app.data.core) continue;

      const button = document.createElement("button");

      button.innerText = app.data.metadata.name;

      button.addEventListener(
        "click",
        this.safeCallback(() => {
          this.startOpened.set(false);
          spawnApp(id, this._pid);
        })
      );

      appList.append(button);
    }
  }

  initializeStartMenu() {
    UserData.subscribe(
      this.safeCallback((v) => {
        if (!v) return (this.usernameField.innerText = "Stranger");

        this.usernameField.innerText = v.username || "Stranger";
      })
    );

    this.startButton.addEventListener(
      "click",
      this.safeCallback(() => {
        this.startOpened.set(!this.startOpened.get());
      })
    );

    this.startOpened.subscribe(
      this.safeCallback((v) => {
        this.startMenu.classList.remove("opened");
        if (v) this.startMenu.classList.add("opened");

        this.startButton.classList.remove("opened");
        if (v) this.startButton.classList.add("opened");
      })
    );
  }

  startClock() {
    const clock = this.getElement(".taskbar #clock");

    if (!clock) throw new AppRuntimeError(`Silly me, there's no clock!`);

    const tick = this.safeCallback(() => {
      clock.innerText = strftime("%l:%M %p");
    });
    setInterval(tick, 500);
    tick();
  }

  startOutsideTrigger() {
    const startMenu = this.getElement("#startMenu", true);
    const startButton = this.getElement("#startButton", true);

    document.addEventListener(
      "click",
      this.safeCallback((e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (
          !e.composedPath().includes(startMenu) &&
          !e.composedPath().includes(startButton)
        ) {
          this.startOpened.set(false);
        }
      })
    );
  }
}
