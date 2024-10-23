import { getJsonHierarchy, setJsonHierarchy } from "../hierarchy.js";
import { KernelModule } from "../kernel/module/index.js";
import { Log } from "../logging.js";
import { Store } from "../store.js";
import { RegistryHives } from "./store.js";

export class IneptaRegistry extends KernelModule {
  store = Store({});
  PATH = "./System/Registry.json";
  fs;

  constructor(kernel, id) {
    super(kernel, id);

    this.fs = kernel.getModule("fs");
  }

  async _init() {
    await this.loadRegistry();

    this.registrySync();
    this.setValue(RegistryHives.kernel, "Registry.lastLoadTime", new Date().getTime());
    this.setValue(RegistryHives.kernel, "Registry.initialSize", JSON.stringify(this.store.get()).length);
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
    const absolutePath = `${hive}.${path}`;
    const store = this.store.get();

    Log(`IneptaRegistry.setValue`, `Registry/${absolutePath.replaceAll(".", "/")}`);

    setJsonHierarchy(store, absolutePath, value);

    this.store.set(store);
  }

  getValue(hive = RegistryHives.local, path) {
    return getJsonHierarchy(this.store.get(), `${hive}.${path}`);
  }
}
