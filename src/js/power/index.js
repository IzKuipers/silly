import { KernelModule } from "../kernel/module/index.js";
import { Sleep } from "../sleep.js";

export class PowerLogic extends KernelModule {
  constructor(kernel, id) {
    super(kernel, id);

    this.registry = kernel.getModule("registry");
  }

  _init() {
    this.setRegistryValue("lastLoadTime", new Date().getTime());
  }

  async shutdown() {
    await this.closeAllWindows();

    this._kernel.state.loadState(
      this._kernel.state.store.login,
      {
        type: "shutdown",
      },
      this.alreadyInLogin()
    );

    this.setRegistryValue("shutdownProperly", true);
    this.setRegistryValue("lastShutdownTime", new Date().getTime());
    this.setRegistryValue("lastShutdownMode", "shutdown");

    setTimeout(async () => {
      await this.closeAllWindows();

      await Sleep(300);

      window.close();
    }, 3000);
  }

  async restart() {
    await this.closeAllWindows();

    this._kernel.state.loadState(
      this._kernel.state.store.login,
      {
        type: "restart",
      },
      this.alreadyInLogin()
    );

    this.setRegistryValue("shutdownProperly", true);
    this.setRegistryValue("lastShutdownTime", new Date().getTime());
    this.setRegistryValue("lastShutdownMode", "restart");

    setTimeout(async () => {
      await this.closeAllWindows();

      await Sleep(300);

      location.reload();
    }, 3000);
  }

  async logoff() {
    await this.closeAllWindows();

    this._kernel.state.loadState(
      this._kernel.state.store.login,
      {
        type: "logout",
      },
      this.alreadyInLogin()
    );
  }

  alreadyInLogin() {
    return this._kernel.state.currentState === "login";
  }

  async closeAllWindows() {
    for (const [_, proc] of this._kernel.stack.store.get()) {
      if (proc.closeWindow) await proc.closeWindow();
    }
  }
}
