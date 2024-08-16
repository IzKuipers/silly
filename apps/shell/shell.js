import { AppProcess } from "../../js/apps/process.js";
import { Store } from "../../js/store.js";
import { UserData } from "../../js/user/data.js";

export default class ShellProcess extends AppProcess {
  startOpened = Store(false);
  startPopulated = false;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  render() {
    this.startActiveAppsPopulator();
    this.populateStartMenu();
  }

  stop() {}

  startActiveAppsPopulator() {
    const activeApps = this.getElement("#activeApps");

    if (!activeApps) throw new Error("Failed to find #activeApps div");

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

  populateStartMenu() {
    const userData = UserData.get();
    const usernameField = this.getElement("#startMenu #username");
    const shutdownButton = this.getElement("#startMenu #shutdown");
    const startButton = this.getElement("#startButton");
    const startMenu = this.getElement("#startMenu");

    if (!usernameField || !shutdownButton || !startButton || !startMenu)
      throw new Error("Missing start menu elements");

    usernameField.innerText = userData.username || "Stranger";

    startButton.addEventListener("click", () => {
      this.startOpened.set(!this.startOpened.get());
    });

    this.startOpened.subscribe((v) => {
      startMenu.classList.remove("opened");
      if (v) startMenu.classList.add("opened");

      startButton.classList.remove("opened");
      if (v) startButton.classList.add("opened");
    });
  }
}
