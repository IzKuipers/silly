import { AppProcess } from "../../js/apps/process.js";
import { spawnApp } from "../../js/apps/spawn.js";
import fs from "../../js/vfs.js";

export default class FileManProcess extends AppProcess {
  path = "/";

  constructor(handler, pid, parentPid, app, path) {
    super(handler, pid, parentPid, app);

    this.path = path || "/";
    app.data.metadata.name = this.path;
  }

  render() {
    this.populate();
  }

  populate() {
    const output = this.getElement("#listing", true);
    const { dirs, files } = fs.readDirectory(this.path);

    output.innerHTML = "";
    output.append(...this.Directories(dirs), ...this.Files(files));
  }

  Directories(dirs) {
    const elements = [];

    for (const dir of dirs) {
      const button = document.createElement("button");
      const icon = document.createElement("img");
      const caption = document.createElement("span");

      icon.src = "/assets/fs/folder.png";
      icon.className = "icon";

      caption.innerText = `${dir}`;

      button.className = "item directory";
      button.addEventListener("click", () => {
        spawnApp("fileMan", this._pid, fs.join(this.path, dir));
      });

      button.append(icon, caption);
      elements.push(button);
    }

    return elements;
  }

  Files(files) {
    const elements = [];

    for (const file of files) {
      const button = document.createElement("button");

      button.innerText = `${file}/`;
      button.className = "item file";
      button.addEventListener("click", () => {
        console.log(fs.readFile(fs.join(this.path, file)));
      });

      elements.push(button);
    }

    return elements;
  }
}
