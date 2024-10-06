import { AppProcess } from "../../js/apps/process.js";
import { UserData } from "../../js/user/data.js";

export default class WelcomeAppProcess extends AppProcess {
  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  async start() {
    const data = UserData.get();

    return !data.welcomed;
  }

  stop() {
    const data = UserData.get();

    data.welcomed = true;

    UserData.set(data);
  }

  render() {
    const nameField = this.getElement("#nameField");
    const setButton = this.getElement("#setButton");

    setButton.disabled = true;

    if (!nameField || !setButton) return this.killSelf();

    nameField.addEventListener("input", () => {
      setButton.disabled = !nameField.value;
    });

    setButton.addEventListener("click", () => {
      const data = UserData.get();

      data.username = nameField.value;
      data.welcomed = true;

      UserData.set(data);
    });
  }
}
