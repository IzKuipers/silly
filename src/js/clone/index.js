import { VERSION } from "../../env.js";
import { KernelModule } from "../kernel/module/index.js";
import { Log } from "../logging.js";
import { Sleep } from "../sleep.js";

const { glob } = require("glob");
const { readFile } = require("fs/promises");
const { statSync } = require("fs");

export class CloneModule extends KernelModule {
  fs;

  constructor(kernel, id) {
    super(kernel, id);

    this.fs = kernel.getModule("fs");
  }

  async _init() {
    const currentVersion = this.getRegistryValue("clonedVersion");

    if (!currentVersion) return this.doClone();

    if (currentVersion === VERSION.join(".")) return;

    this.doClone();
  }

  async doClone() {
    const paths = (await glob("src/**/*")).filter(
      (p) => !p.includes("node_modules") && statSync(p).isFile()
    );

    Log(
      "CloneModule.doClone",
      `Cloning ${paths.length} system files to the filesystem`
    );

    for (const path of paths) {
      Log("CloneModule.doClone", path);

      this.fs.writeFile(
        path.replace("src", "System"),
        await readFile(path, "utf-8")
      );
    }

    this.setRegistryValue("clonedVersion", VERSION.join("."));
    await Sleep(100);
    location.reload();
  }
}
