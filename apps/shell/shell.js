import { AppRuntimeError } from "../../js/apps/error.js";
import { AppProcess } from "../../js/apps/process.js";
import { spawnApp } from "../../js/apps/spawn.js";
import { AppStore } from "../../js/apps/store.js";
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
    this.initializeStartMenu();

    AppStore.subscribe((v) => {
      if (!v) return;

      this.populateAppList();
    });
  }

  stop() {}

  startActiveAppsPopulator() {
    const activeApps = this.getElement("#activeApps");

    if (!activeApps)
      throw new AppRuntimeError("Failed to find #activeApps div");

    const populate = (v = this.handler.store.get()) => {
      activeApps.innerHTML = "";

      for (const [pid, proc] of [...v]) {
        if (!proc.app || proc.app.data.core || proc._disposed) continue;

        const button = document.createElement("button");

        button.setAttribute("data-pid", pid);
        button.className = `${proc.app.data.id} opened-app`;
        button.innerText = proc.app.data.metadata.name;

        activeApps.append(button);
      }
    };

    this.handler.store.subscribe(populate);
  }

  populateAppList() {
    const appList = this.appList;
    const apps = AppStore.get();

    this.appList.innerHTML = "";

    for (const [id, app] of Object.entries(apps)) {
      if (!app || !app.data || app.data.hidden || app.data.core) continue;

      const button = document.createElement("button");

      button.innerText = app.data.metadata.name;

      button.addEventListener("click", () => {
        this.startOpened.set(false);
        spawnApp(id);
      });

      appList.append(button);
    }
  }

  initializeStartMenu() {
    this.usernameField.innerText = this.userData.username || "Stranger";

    this.startButton.addEventListener("click", () => {
      this.startOpened.set(!this.startOpened.get());
    });

    this.startOpened.subscribe((v) => {
      this.startMenu.classList.remove("opened");
      if (v) this.startMenu.classList.add("opened");

      this.startButton.classList.remove("opened");
      if (v) this.startButton.classList.add("opened");
    });
  }
}
