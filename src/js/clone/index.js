import { VERSION } from "../../env.js";
import { KernelModule } from "../kernel/module/index.js";
import { Log, LogStore, LogType } from "../logging.js";
import { Sleep } from "../sleep.js";

const { glob } = require("glob");
const { readFile } = require("fs/promises");
const { statSync } = require("fs");

export class CloneModule extends KernelModule {
  fs;
  needsClone = false;

  constructor(kernel, id) {
    super(kernel, id);

    this.fs = kernel.getModule("fs");
  }

  async _init() {
    const runningClone = location.href
      .toLowerCase()
      .includes("local/inepta/src");
    const isLive = navigator.userAgent.includes("LIVEMODE");

    if (runningClone || isLive) {
      this.setRegistryValue("isLive", isLive);
      this.setRegistryValue("runningClone", runningClone);

      return;
    }

    const currentVersion = this.getRegistryValue("clonedVersion");

    if (!currentVersion) return (this.needsClone = true);

    if (currentVersion === VERSION.join(".")) {
      location.href = this.fs.join(this.fs.root, "src/index.html");
      return;
    }

    this.needsClone = true;
  }

  async doClone(cb = () => {}) {
    const paths = (await glob("./**/*")).filter((p) => statSync(p).isFile());

    Log(
      "CloneModule.doClone",
      `Cloning ${paths.length} system files to the filesystem`
    );

    for (const path of paths) {
      Log("CloneModule.doClone", path);

      try {
        this.fs.writeFile(path, await readFile(path));

        cb(path);
      } catch {
        Log(
          "CloneModule.doClone",
          `FAILURE: ${path}! Inepta might not work properly`,
          LogType.error
        );
        cb(`${path} (FAILED)`);
      }

      await Sleep(0);
    }

    const logs = {};

    for (let i = 0; i < LogStore.length; i++) {
      logs[`LogItem#${i}`] = LogStore[i];
    }

    this.setRegistryValue("clonedVersion", VERSION.join("."));
    this.setRegistryValue("cloneLog", logs);
    await Sleep(100);
    location.reload();
  }
}
