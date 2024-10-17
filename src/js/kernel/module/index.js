import { Log } from "../../logging.js";
import { RegistryHives } from "../../registry/store.js";

export class KernelModule {
  _id;
  _kernel;

  constructor(kernel, id) {
    if (kernel.getModule(id)) throw new Error(`Kernel.${id} is already loaded`);

    this._id = id;
    this._kernel = kernel;
  }

  setRegistryValue(key, value) {
    const path = `${this._id}.${key}`;

    this._kernel.registry.setValue(RegistryHives.kernel, path, value);
  }

  getRegistryValue(key) {
    const path = `${this._id}.${key}`;

    return this._kernel.registry.getValue(RegistryHives.kernel, path);
  }

  async __init() {
    Log(`KernelModule::${this._id}`, `Calling _init`);

    await this._init();
  }

  async _init() {
    /** Dummy */
  }
}
