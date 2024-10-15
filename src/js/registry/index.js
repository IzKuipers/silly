import { getJsonHierarchy, setJsonHierarchy } from "../hierarchy.js";
import { KernelModule } from "../kernel/module/index.js";
import { Store } from "../store.js";
import { RegistryHives } from "./store.js";

export class IneptaRegistry extends KernelModule {
  store = Store({});
  PATH = "./registry.json";
  fs;

  constructor(kernel, id) {
    super(kernel, id);

    this.fs = kernel.getModule("fs");
  }

  async _init() {
    await this.loadRegistry();

    this.registrySync();
  }

  async loadRegistry() {
    try {
      const contents = this.fs.readFile(this.PATH);

      this.store.set(JSON.parse(contents));
    } catch {
      this.store.set({});

      this.fs.writeFile(this.PATH, JSON.stringify({}));
    }
  }

  registrySync() {
    this.store.subscribe((v) => {
      this.fs.writeFile(this.PATH, JSON.stringify(v));
    });
  }

  stop() {
    this.store.destroy();
  }

  setValue(hive = RegistryHives.local, path, value) {
    const store = this.store.get();

    setJsonHierarchy(store, `${hive}.${path}`, value);

    this.store.set(store);
  }

  getValue(hive = RegistryHives.local, path) {
    return getJsonHierarchy(this.store.get(), `${hive}.${path}`);
  }
}
