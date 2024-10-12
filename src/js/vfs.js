import { KernelModule } from "./kernel/module/index.js";
import { Log } from "./logging.js";

const fs = require("fs");
const path = require("path");
const os = require("os");

export class FileSystem extends KernelModule {
  constructor(kernel, id) {
    super(kernel, id);
  }

  _init() {
    Log("FileSystem._init", "Constructing new Filesystem integration");

    this.root = this.getAppDataPath();

    if (!fs.existsSync(this.root)) {
      fs.mkdirSync(this.root, { recursive: true });
    }
  }

  getAppDataPath() {
    const platform = os.platform();
    return platform === "win32"
      ? path.join(process.env.LOCALAPPDATA, "inepta")
      : path.join(os.homedir(), ".local", "inepta");
  }

  ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  traverse(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      throw new Error(`Directory ${pathStr} does not exist.`);
    }
    return fullPath;
  }

  join(...paths) {
    return path.join(...paths);
  }

  writeFile(pathStr, content) {
    const fullPath = path.join(this.root, pathStr);
    const dirPath = path.dirname(fullPath);
    this.ensureDirSync(dirPath);

    const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
    fs.writeFileSync(fullPath, data);
  }

  readFile(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
      throw new Error(`File ${pathStr} does not exist.`);
    }
    return fs.readFileSync(fullPath);
  }

  deleteFile(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File ${pathStr} does not exist.`);
    }
    fs.unlinkSync(fullPath);
  }

  createDirectory(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    this.ensureDirSync(fullPath);
  }

  readDirectory(pathStr) {
    const fullPath = this.traverse(pathStr);
    const dirEntries = fs.readdirSync(fullPath, { withFileTypes: true });

    return {
      dirs: dirEntries
        .filter((entry) => entry.isDirectory())
        .map((dir) => ({
          name: dir.name,
          dateCreated: fs.statSync(path.join(fullPath, dir.name)).birthtime,
          dateModified: fs.statSync(path.join(fullPath, dir.name)).mtime,
        })),
      files: dirEntries
        .filter((entry) => entry.isFile())
        .map((file) => ({
          name: file.name,
          size: fs.statSync(path.join(fullPath, file.name)).size,
          dateCreated: fs.statSync(path.join(fullPath, file.name)).birthtime,
          dateModified: fs.statSync(path.join(fullPath, file.name)).mtime,
        })),
    };
  }

  deleteDirectory(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      throw new Error(`Directory ${pathStr} does not exist.`);
    }
    fs.rmdirSync(fullPath, { recursive: true });
  }

  isFile(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
  }

  isDir(pathStr) {
    const fullPath = path.join(this.root, pathStr);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  }

  reset() {
    if (fs.existsSync(this.root)) {
      fs.rmdirSync(this.root, { recursive: true });
    }
    fs.mkdirSync(this.root, { recursive: true });
  }
}
