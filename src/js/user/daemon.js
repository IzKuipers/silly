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
    this.userlogic = this.handler._kernel.getModule("userlogic");
  }

  async start() {
    this.preferencesPath = `./Users/${this.username}/preferences.json`;

    await this.loadPreferences();
    this.preferencesSync();
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
      this.fs.writeFile(this.preferencesPath, JSON.stringify(v, null, 2));
    });
  }

  async stop() {
    const stack = this.handler;

    for (const [_, proc] of stack.store.get()) {
      if (proc.closeWindow) await proc.closeWindow();
    }

    KERNEL.state.loadState(KERNEL.state.store.login);
  }
}
