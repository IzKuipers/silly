import { AppProcess } from "../../js/apps/process.js";
import { spawnApp } from "../../js/apps/spawn.js";
import fs from "../../js/vfs.js";
import { strftime } from "../../js/desktop/date.js";

export default class FileManProcess extends AppProcess {
  path = "/";

  constructor(handler, pid, parentPid, app, path) {
    super(handler, pid, parentPid, app);

    this.path = path || "/";
    app.data.metadata.name = this.path;
  }

  render() {
    this.populate();
    console.log(this);
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
      const row = document.createElement("tr");

      const nameFiled = document.createElement("td");
      const dateModifiedField = document.createElement("td");
      const dateCreatedField = document.createElement("td");
      const sizeField = document.createElement("td");

      nameFiled.className = "name";
      dateModifiedField.className = "modified";
      dateCreatedField.className = "created";
      sizeField.className = "size";

      nameFiled.innerText = file.name;
      dateModifiedField.innerText = strftime(
        "%d-%m-%Y %H:%M",
        new Date(file.dateModified)
      );
      dateCreatedField.innerText = strftime(
        "%d-%m-%Y %H:%M",
        new Date(file.dateCreated)
      );
      sizeField.innerText = `${file.size} bytes`;

      row.append(nameFiled, dateModifiedField, dateCreatedField, sizeField);
      row.className = "item";
      row.addEventListener("click", () => {
        spawnApp("napkinText", undefined, fs.join(this.path, file.name));
      });

      elements.push(row);
    }

    return elements;
  }
}
