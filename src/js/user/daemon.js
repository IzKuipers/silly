import { KERNEL } from "../../env.js";
import { Process } from "../process/instance.js";
import { UserData } from "./data.js";
import { DefaultUserPreferences } from "./store.js";

export class UserDaemon extends Process {
  preferencesPath = "";
  username = "";
  userlogic;
  fs;

  constructor(handler, pid, parentPid, username) {
    super(handler, pid, parentPid);

    this.username = username;
    this.fs = this.handler._kernel.getModule("fs");
    this.registry = this.handler._kernel.getModule("registry");
    this.userlogic = this.handler._kernel.getModule("userlogic");
  }

  async start() {
    this.registry.setValue("UserDaemon.lastLoginName", this.username);
    this.registry.setValue("UserDaemon.lastLoginTime", new Date().getTime());

    this.preferencesPath = `./Users/${this.username}/preferences.json`;

    await this.loadPreferences();
    await this.checkUserFolders();
    this.preferencesSync();

    UserData.subscribe((v) => {
      if (!this._disposed) {
        this.registry.setValue("CurrentUser", v);
      }
    });
  }

  async checkUserFolders() {
    await this.fs.createDirectory(`./Users/${this.username}/Documents`);
    await this.fs.createDirectory(`./Users/${this.username}/Pictures`);
    await this.fs.createDirectory(`./Users/${this.username}/Apps`);
  }

  async loadPreferences() {
    try {
      const contents = this.fs.readFile(this.preferencesPath);

      UserData.set({
        ...JSON.parse(contents.toString()),
        username: this.username,
      });
    } catch {
      UserData.set(DefaultUserPreferences);

      this.fs.writeFile(
        this.preferencesPath,
        JSON.stringify({ ...DefaultUserPreferences, username: this.username })
      );
    }
  }

  preferencesSync() {
    UserData.subscribe((v) => {
      if (this._disposed) return;
      this.fs.writeFile(this.preferencesPath, JSON.stringify(v, null, 2));
    });
  }

  async stop() {
    const stack = this.handler;

    for (const [_, proc] of stack.store.get()) {
      if (proc.closeWindow) await proc.closeWindow();
    }

    KERNEL.state.loadState(KERNEL.state.store.login, { type: "logout" });
  }
}
