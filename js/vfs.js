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

    if (currentDir.files.some((file) => file.name === fileName)) {
      return this.updateFile(path, content);
    }

    let base64Content, type, size;

    if (content instanceof Uint8Array) {
      base64Content = this.byteArrayToBase64(content);
      type = "binary";
      size = content.length;
    } else if (typeof content === "string") {
      base64Content = btoa(content);
      type = "text";
      size = content.length;
    } else {
      throw new Error(
        "Unsupported content type. Must be either a string or Uint8Array."
      );
    }

    const dateNow = new Date().toISOString();

    const fileData = {
      name: fileName,
      content: base64Content,
      type: type,
      size: size,
      dateCreated: dateNow,
      dateModified: dateNow,
    };

    currentDir.files.push(fileData);
    this.saveFS();
  }

  readFile(path) {
    const dirs = path.split("/").filter(Boolean);
    const fileName = dirs.pop();
    let currentDir = this.traverse("/" + dirs.join("/"));

    const file = currentDir.files.find((file) => file.name === fileName);
    if (!file) {
      throw new Error(`File ${fileName} does not exist.`);
    }

    if (file.type === "text") {
      return atob(file.content);
    } else if (file.type === "binary") {
      return this.base64ToByteArray(file.content);
    } else {
      throw new Error("Unknown file type.");
    }
  }

  updateFile(path, newContent) {
    const dirs = path.split("/").filter(Boolean);
    const fileName = dirs.pop();
    let currentDir = this.traverse("/" + dirs.join("/"));

    const file = currentDir.files.find((file) => file.name === fileName);

    if (!file) {
      throw new Error(`File ${fileName} does not exist.`);
    }

    if (newContent instanceof Uint8Array) {
      file.content = this.byteArrayToBase64(newContent);
      file.size = newContent.length;
      file.type = "binary";
    } else if (typeof newContent === "string") {
      file.content = btoa(newContent);
      file.size = newContent.length;
      file.type = "text";
    } else {
      throw new Error(
        "Unsupported content type. Must be either a string or Uint8Array."
      );
    }

    file.dateModified = new Date().toISOString();

    this.saveFS();
  }

  deleteFile(path) {
    const dirs = path.split("/").filter(Boolean);
    const fileName = dirs.pop();

    let currentDir = this.traverse("/" + dirs.join("/"));

    const fileIndex = currentDir.files.findIndex(
      (file) => file.name === fileName
    );

    if (fileIndex === -1) {
      throw new Error(`File ${fileName} does not exist.`);
    }

    currentDir.files.splice(fileIndex, 1);

    this.saveFS();
  }

  createDirectory(path) {
    const dirs = path.split("/").filter(Boolean);
    let currentDir = this.fs;

    dirs.forEach((dir) => {
      if (!currentDir.dirs[dir]) {
        currentDir.dirs[dir] = {
          dirs: {},
          files: [],
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString(),
        };
      }
      currentDir = currentDir.dirs[dir];
    });

    this.saveFS();
  }

  readDirectory(path) {
    let currentDir = this.traverse(path);
    return {
      dirs: Object.entries(currentDir.dirs).map(([name, dir]) => ({
        name,
        dateCreated: dir.dateCreated,
        dateModified: dir.dateModified,
      })),
      files: currentDir.files.map((file) => ({
        name: file.name,
        size: file.size,
        dateCreated: file.dateCreated,
        dateModified: file.dateModified,
      })),
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
