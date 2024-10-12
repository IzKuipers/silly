import { VERSION } from "../../env.js";
import { isLoaded, loadApp } from "../../js/apps/load.js";
import { AppProcess } from "../../js/apps/process.js";
import { AppStore } from "../../js/apps/store.js";
import { MessageBox } from "../../js/desktop/message.js";
import { MessageIcons } from "../../js/images/msgbox.js";
import { UserDaemon } from "../../js/user/daemon.js";
import { MsgBoxApp } from "../messagebox/metadata.js";
import { AppRuntimeError } from "../../js/apps/error.js";
import { Sleep } from "../../js/sleep.js";
import { spawnApp } from "../../js/apps/spawn.js";
import { getStateProps, StateProps } from "../../js/state/store.js";

export default class LoginAppProcess extends AppProcess {
  fs;
  state;
  userlogic;
  type;

  constructor(handler, pid, parentPid, app, type) {
    super(handler, pid, parentPid, app);

    this.kernel = this.handler._kernel;
    this.type = type;
  }

  async render() {
    await this.satisfyDependencies();

    const stateHandler = this.kernel.getModule("state");
    const { currentState } = stateHandler;

    if (currentState !== "login") {
      throw new AppRuntimeError(`Can't launch LoginApp: invalid context`);
    }

    this._prepare();

    this.type ||= getStateProps({ identifier: "login" }).type;

    if (!this.type) return;

    switch (this.type) {
      case "shutdown":
        this.shutDown();
        break;
      case "restart":
        this.restart();
        break;
      case "logout":
        this.logout();
        break;
      default:
        throw new AppRuntimeError(`Don't know what to do with type "${type}"`);
    }
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
      this.safe(async () => {
        loginButton.disabled = true;

        await this.proceed(usernameField.value, passwordField.value);

        loginButton.disabled = false;
      })
    );

    shutdownButton.addEventListener(
      "click",
      this.safe(() => this.shutdown())
    );

    cancelButton.addEventListener("click", () => {
      this.closeWindow();
      setTimeout(() => {
        spawnApp("loginApp");
      }, 100);
    });

    cancelButton.disabled = false;
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

    this.displayStatus(`Welcome, ${username}! Logging you in...`);
    await Sleep(800);

    this.displayStatus(`Spawning UserDaemon`);
    await Sleep(100);

    await this.startDaemon(username);

    this.displayStatus(`Resetting app storage`);
    await Sleep(100);

    AppStore.set({});

    this.displayStatus(`Terminating graphical processes`);
    await Sleep(100);

    for (const [pid, proc] of this.handler.store.get()) {
      this.displayStatus(`Terminating process ${pid}`);

      if (proc.closeWindow) await proc.closeWindow();
    }

    this.displayStatus(`Navigating to desktop`);
    await Sleep(100);

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

  async startDaemon(username) {
    await this.handler.spawn(
      UserDaemon,
      this.handler._kernel.initPid,
      username
    );
  }

  displayStatus(status) {
    const statusDiv = this.getElement("#status", true);
    const container = this.getElement("#container", true);
    const banner = this.getElement("#banner", true);

    statusDiv.innerText = status;
    statusDiv.classList.remove("hidden");
    container.classList.add("hidden");
    banner.classList.add("loading");
  }

  hideStatus() {
    const statusDiv = this.getElement("#status", true);
    const container = this.getElement("#container", true);
    const banner = this.getElement("#banner", true);

    statusDiv.innerText = "";
    statusDiv.classList.add("hidden");
    container.classList.remove("hidden");
    banner.classList.remove("loading");
  }

  async logout() {
    this.displayStatus("Logging you out...");

    await Sleep(2000);

    this.closeWindow();
    StateProps["login"] = {};

    await Sleep(100);

    spawnApp("loginApp");
  }

  async shutdown() {
    this.displayStatus("Inepta is shutting down...");

    await Sleep(2000);

    (() => {
      throw new Error("SHUTDOWN GOES HERE");
    })();
  }

  async restart() {
    this.displayStatus("Inepta is restarting...");

    await Sleep(2000);
    await this.state.loadState(this.state.store.boot);

    location.reload();
  }
}
