import { getJsonHierarchy, setJsonHierarchy } from "../hierarchy.js";
import { KernelModule } from "../kernel/module/index.js";
import { Store } from "../store.js";

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

    this.setValue("KERNEL.loadTime.registry.relative", this._kernel.startMs);
    this.setValue("KERNEL.loadTime.registry.absolute", new Date().getTime());
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

  setValue(path, value) {
    const store = this.store.get();

    setJsonHierarchy(store, path, value);

    this.store.set(store);
  }

  getValue(path) {
    return getJsonHierarchy(this.store.get(), path);
  }
}
