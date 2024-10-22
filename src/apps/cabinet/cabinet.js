import { AppProcess } from "../../js/apps/process.js";
import { spawnApp } from "../../js/apps/spawn.js";
import { strftime } from "../../js/desktop/date.js";
import { MessageBox } from "../../js/desktop/message.js";
import { MessageIcons } from "../../js/images/msgbox.js";

const { sep } = require("path");

export default class CabinetProcess extends AppProcess {
  path;
  contents;

  constructor(handler, pid, parentPid, app, path) {
    super(handler, pid, parentPid, app);

    this.path = path || this.environment.getProperty("userprofile");
    this.fs = this.kernel.getModule("fs");
    console.log(this.path);
  }

  render() {
    this.navigate(this.path);
    this.updateLocations();
    this.updateFavourites();
  }

  navigate(path) {
    try {
      const contents = this.fs.readDirectory(path);

      this.path = path;
      this.contents = contents;
    } catch {
      MessageBox({
        title: "Can't open directory",
        message: `The specified directory could not be found. Please check the name and try again.<br><br>Path: ${path}`,
        buttons: [{ caption: "Okay", action() {} }],
        icon: MessageIcons.critical,
      });
    }

    this.updateStatusbar();
    this.populateDirectory();

    this.windowTitle.set(this.path);
  }

  updateStatusbar() {
    if (!this.contents || !this.contents.files || !this.contents.dirs) return;

    const split = this.path.split(sep);

    const fileCount = this.getElement("#fileCount", true);
    const folderCount = this.getElement("#folderCount", true);
    const folderName = this.getElement("#folderName", true);
    const parentName = this.getElement("#parentName", true);

    fileCount.innerText = `${this.contents.files.length} file(s)`;
    folderCount.innerText = `${this.contents.dirs.length} folder(s)`;

    folderName.innerText =
      split.length > 1 ? split[split.length - 1] : split[0];
    parentName.innerText =
      split.length > 1 ? `In ${split[split.length - 2]}` : "Inepta HD";
  }

  populateDirectory() {
    if (!this.contents || !this.contents.files || !this.contents.dirs) return;
    const container = this.getElement("#container", true);

    container.innerHTML = "";

    container.append(this._topItem());

    for (const directory of this.contents.dirs) {
      const element = this._folderItem(directory);

      container.append(element);
    }

    for (const file of this.contents.files) {
      const element = this._fileItem(file);

      container.append(element);
    }
  }

  _topItem() {
    const { item, name, icon, modified, created, size } = this._baseItem();

    item.classList.add("header");
    name.innerText = "Name";
    modified.innerText = "Date Modified";
    created.innerText = "Date Created";
    size.innerText = "Size";
    icon.remove();

    return item;
  }

  _folderItem(directory) {
    const { item, name, icon, modified, created, size } = this._baseItem();

    item.classList.add("folder");
    icon.src = "./assets/fs/folder.svg";

    name.innerText = directory.name;
    modified.innerText = strftime(
      "%e %b %G %H:%M",
      new Date(directory.dateModified)
    );
    created.innerText = strftime(
      "%e %b %G %H:%M",
      new Date(directory.dateCreated)
    );
    size.innerText = "-";

    item.addEventListener("click", () => {
      this.navigate(this.fs.join(this.path, directory.name));
    });

    return item;
  }

  _fileItem(file) {
    const { item, name, icon, modified, created, size } = this._baseItem();

    item.classList.add("file");
    icon.src = "./assets/fs/file.svg";

    name.innerText = file.name;
    modified.innerText = strftime(
      "%e %b %G %H:%M",
      new Date(file.dateModified)
    );
    created.innerText = strftime("%e %b %G %H:%M", new Date(file.dateCreated));
    size.innerText = file.size;

    item.addEventListener("click", () => {
      spawnApp("napkin", undefined, this.fs.join(this.path, file.name));
    });

    return item;
  }

  _baseItem() {
    const item = document.createElement("div");
    const name = document.createElement("div");
    const icon = document.createElement("img");
    const modified = document.createElement("div");
    const created = document.createElement("div");
    const size = document.createElement("div");

    icon.className = "icon";
    icon.src = "./assets/fs/file.svg";

    item.className = "item";
    name.className = "field name";
    modified.className = "field modified";
    created.className = "field created";
    size.className = "field size";

    name.innerText = "NAME";
    modified.innerText = "MODIFIED";
    created.innerText = "CREATED";
    size.innerText = "SIZE";

    item.append(icon, name, modified, created, size);

    return { item, icon, name, modified, created, size };
  }

  updateFavourites() {}

  updateLocations() {
    const locations = this.getElement("#locations", true);

    locations.innerHTML = "";

    const driveItem = document.createElement("button");
    const driveIcon = document.createElement("img");
    const driveCaption = document.createElement("span");

    driveItem.className = "item";
    driveCaption.innerText = "Inepta HD";
    driveIcon.src = "./assets/fs/drive.svg";

    driveItem.addEventListener("click", () => {
      this.navigate(".");
    });

    driveItem.append(driveIcon, driveCaption);
    locations.append(driveItem);
  }
}
