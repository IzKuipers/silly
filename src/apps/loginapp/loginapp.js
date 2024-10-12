import { VERSION } from "../../env.js";
import { isLoaded, loadApp } from "../../js/apps/load.js";
import { AppProcess } from "../../js/apps/process.js";
import { AppStore } from "../../js/apps/store.js";
import { MessageBox } from "../../js/desktop/message.js";
import { MessageIcons } from "../../js/images/msgbox.js";
import { MsgBoxApp } from "../messagebox/metadata.js";

export default class LoginAppProcess extends AppProcess {
  fs;
  state;
  userlogic;

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.kernel = this.handler._kernel;
  }

  async render() {
    const stateHandler = this.kernel.getModule("state");
    const { currentState } = stateHandler;

    if (currentState !== "login") {
      this.closeWindow();

      return;
    }

    await this.satisfyDependencies();
    this._prepare();
  }

  async satisfyDependencies() {
    if (!isLoaded("msgBox")) await loadApp(MsgBoxApp);

    this.fs = this.kernel.getModule("fs");
    this.state = this.kernel.getModule("state");
    this.userlogic = this.kernel.getModule("userlogic");
  }

  _prepare() {
    const usernameField = this.getElement("#usernameField", true);
    const passwordField = this.getElement("#passwordField", true);
    const loginButton = this.getElement("#loginButton", true);
    const cancelButton = this.getElement("#cancelButton", true);
    const shutdownButton = this.getElement("#shutdownButton", true);
    const versionNumber = this.getElement("#versionNumber", true);

    versionNumber.innerText = `${VERSION[0]}.${VERSION[1]}`;

    function onValuesChange() {
      loginButton.disabled = !usernameField.value || !passwordField.value;
    }

    loginButton.addEventListener(
      "click",
      this.safe(() => {
        this.proceed(usernameField.value, passwordField.value);
      })
    );

    loginButton.disabled = true;

    usernameField.addEventListener(
      "input",
      this.safe(() => onValuesChange())
    );
    passwordField.addEventListener(
      "input",
      this.safe(() => onValuesChange())
    );
  }

  async proceed(username, password) {
    const valid = await this.isValid(username, password);

    if (!valid) {
      MessageBox({
        title: "Failed to log you on",
        message:
          "Either the username or password you provided is incorrect. Please check your credentials and try again. If you forgot your credentials, contact your system administrator.",
        buttons: [{ caption: "Okay", action() {} }],
        icon: MessageIcons.warning,
      });

      return;
    }

    // SPAWN USER DAEMON

    AppStore.set({});

    for (const [_, proc] of this.handler.store.get()) {
      if (proc.closeWindow) await proc.closeWindow();
    }

    await this.state.loadState(this.state.store.desktop);
  }

  async isValid(username, password) {
    const user = this.userlogic.getUser(username);

    if (!user) return false;

    const passwordValid = await this.userlogic.verifyPassword(
      password,
      user.password
    );

    if (!passwordValid) return false;

    return true;
  }
}
