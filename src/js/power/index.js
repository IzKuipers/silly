import { KernelModule } from "../kernel/module/index.js";

export class PowerLogic extends KernelModule {
  constructor(kernel, id) {
    super(kernel, id);
  }

  _init() {}

  async shutdown() {
    await this.closeAllWindows();

    this._kernel.state.loadState(
      this._kernel.state.store.login,
      {
        type: "shutdown",
      },
      this.alreadyInLogin()
    );

    setTimeout(() => {
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

    setTimeout(() => {
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
