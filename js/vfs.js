export class VirtualFileSystem {
  constructor() {
    this.root = "/";
    this.fs = this.loadFS() || { dirs: {}, files: [] };

    this.saveFS();
  }

  saveFS() {
    localStorage.setItem("virtualFS", JSON.stringify(this.fs));
  }

  loadFS() {
    const data = localStorage.getItem("virtualFS");
    return data ? JSON.parse(data) : null;
  }

  traverse(path) {
    const dirs = path.split("/").filter(Boolean);
    let currentDir = this.fs;

    for (let dir of dirs) {
      if (!currentDir.dirs[dir]) {
        throw new Error(`Directory ${dir} does not exist.`);
      }
      currentDir = currentDir.dirs[dir];
    }

    return currentDir;
  }

  join(...paths) {
    return paths
      .map((path) => path.split("/").filter(Boolean))
      .flat()
      .join("/");
  }

  byteArrayToBase64(byteArray) {
    return btoa(String.fromCharCode(...byteArray));
  }

  base64ToByteArray(base64) {
    return new Uint8Array(
      atob(base64)
        .split("")
        .map((char) => char.charCodeAt(0))
    );
  }

  writeFile(path, content) {
    const dirs = path.split("/").filter(Boolean);
    const fileName = dirs.pop();
    let currentDir = this.traverse("/" + dirs.join("/"));

    let base64Content, type;

    if (content instanceof Uint8Array) {
      base64Content = this.byteArrayToBase64(content);
      type = "binary";
    } else if (typeof content === "string") {
      base64Content = btoa(content);
      type = "text";
    } else {
      throw new Error(
        "Unsupported content type. Must be either a string or Uint8Array."
      );
    }

    if (!currentDir.files.includes(fileName)) currentDir.files.push(fileName);
    currentDir[fileName] = { content: base64Content, type: type };
    this.saveFS();
  }

  readFile(path) {
    const dirs = path.split("/").filter(Boolean);
    const fileName = dirs.pop();
    let currentDir = this.traverse("/" + dirs.join("/"));

    if (!currentDir.files.includes(fileName)) {
      throw new Error(`File ${fileName} does not exist.`);
    }

    const fileData = currentDir[fileName];

    if (fileData.type === "text") {
      return atob(fileData.content);
    } else if (fileData.type === "binary") {
      return this.base64ToByteArray(fileData.content);
    } else {
      throw new Error("Unknown file type.");
    }
  }

  deleteFile(path) {
    const dirs = path.split("/").filter(Boolean);
    const fileName = dirs.pop();
    let currentDir = this.traverse("/" + dirs.join("/"));

    if (!currentDir.files.includes(fileName)) {
      throw new Error(`File ${fileName} does not exist.`);
    }

    currentDir.files = currentDir.files.filter((file) => file !== fileName);
    delete currentDir[fileName];
    this.saveFS();
  }

  createDirectory(path) {
    const dirs = path.split("/").filter(Boolean);
    let currentDir = this.fs;

    dirs.forEach((dir) => {
      if (!currentDir.dirs[dir]) {
        currentDir.dirs[dir] = { dirs: {}, files: [] };
      }
      currentDir = currentDir.dirs[dir];
    });

    this.saveFS();
  }

  readDirectory(path) {
    let currentDir = this.traverse(path);
    return {
      dirs: Object.keys(currentDir.dirs),
      files: currentDir.files,
    };
  }

  deleteDirectory(path) {
    const dirs = path.split("/").filter(Boolean);
    const dirName = dirs.pop();
    let currentDir = this.traverse("/" + dirs.join("/"));

    if (!currentDir.dirs[dirName]) {
      throw new Error(`Directory ${dirName} does not exist.`);
    }

    delete currentDir.dirs[dirName];
    this.saveFS();
  }

  isFile(path) {
    try {
      this.readFile(path);

      return true;
    } catch {
      return false;
    }
  }

  isDir(path) {
    try {
      this.readDirectory(path);

      return true;
    } catch {
      return false;
    }
  }

  reset() {
    this.fs = { dirs: {}, files: [] };
    this.saveFS();
  }
}

const fs = new VirtualFileSystem();
window._fs = fs;

export default fs;
