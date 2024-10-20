import { KernelModule } from "../kernel/module/index.js";
import { RegistryHives } from "../registry/store.js";
import { Store } from "../store.js";

export class Environment extends KernelModule {
  VALID_TYPES = ["string", "number", "boolean"];
  store = Store({});

  constructor(kernel, id) {
    super(kernel, id);

    this.registry = kernel.getModule("registry");
  }

  async _init() {
    this.loadEnvironment();
    this.environmentSync();

    this.setRegistryValue("lastLoadTime", new Date().getTime());
  }

  loadEnvironment() {
    this.store.set(
      this.registry.getValue(RegistryHives.local, "Environment") || {}
    );
  }

  environmentSync() {
    this.store.subscribe((v) => {
      this.registry.setValue(RegistryHives.local, "Environment", v);
    });
  }

  setProperty(key, value) {
    const isValid =
      key &&
      value &&
      this.VALID_TYPES.includes(typeof value) &&
      typeof key === "string";

    if (!isValid) return false;

    const store = this.store.get();

    store[key.toUpperCase()] = value;

    this.store.set(store);
  }

  getProperty(key) {
    return this.store.get()[key.toUpperCase()];
  }

  getAll() {
    return this.store.get();
  }
}
