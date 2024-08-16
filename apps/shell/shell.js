import { AppProcess } from "../../js/apps/process.js";
import { UserData } from "../../js/user/data.js";

export default class ShellProcess extends AppProcess {
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

    console.log("Asdfasdf");

    if (!activeApps) throw new Error("Failed to find #activeApps div");

    const populate = (v = this.handler.store.get()) => {
      console.log("asdf");

      activeApps.innerHTML = "";

      for (const [pid, proc] of [...v]) {
        if (!proc.app || proc.app.data.core || proc._disposed) continue;

        console.warn(proc);

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

    if (!usernameField || !shutdownButton)
      throw new Error("Missing start menu elements");

    usernameField.innerText = userData.username || "Stranger";
  }
}
