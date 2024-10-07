import { AppProcess } from "../../js/apps/process.js";
import { Store } from "../../js/store.js";

export default class ProgManProcess extends AppProcess {
  content;
  selectedPid = Store(-1);

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  render() {
    this.content = this.getElement("div#content", true);

    this.handler.store.subscribe(
      this.safeCallback((v) => {
        this.update(v);
      })
    );
  }

  update(processes) {
    const counter = this.getElement("#runningAppsCounter", true);

    counter.innerText = `${
      [...processes].filter(([_, proc]) => !proc._disposed).length
    } running process(es)`;

    this.content.innerHTML = "";

    this._createHeader();

    for (const [_, process] of processes) {
      if (process.parentPid || process._disposed) continue;

      this.processRow(process);
    }
  }

  _createHeader() {
    const row = document.createElement("div");

    row.className = "row header";

    const { nameSegment, titleSegment, pidSegment, idSegment } =
      this.segments();

    nameSegment.innerText = "Name";
    titleSegment.innerText = "Title";
    pidSegment.innerText = "PID";
    idSegment.innerText = "ID";

    row.append(nameSegment, titleSegment, pidSegment, idSegment);
    this.content.append(row);
  }

  processRow(process, target = this.content) {
    if (process._disposed) return;
    const row = document.createElement("div");

    this.selectedPid.subscribe((v) => {
      if (process._pid === v) {
        row.classList.add("selected");
      } else {
        row.classList.remove("selected");
      }
    });

    row.addEventListener("click", () => {
      this.selectedPid.set(process._pid);
    });

    row.className = "row";

    const { nameSegment, titleSegment, pidSegment, idSegment } =
      this.segments();

    console.log(process, process.app, process.name);

    try {
      nameSegment.innerText = process.name;
      titleSegment.innerText = process.app.data.metadata.name;
      idSegment.innerText = process.app.id;
    } catch {
      titleSegment.innerText = "-";
      titleSegment.classList.add("empty");
      idSegment.innerText = "-";
      idSegment.classList.add("empty");
    }

    pidSegment.innerText = process._pid;

    row.append(nameSegment, titleSegment, pidSegment, idSegment);

    const subProcesses = this.handler.getSubProcesses(process._pid);
    const indent = document.createElement("div");

    for (const [_, process] of subProcesses) {
      this.processRow(process, indent);
    }

    indent.className = "indent";
    indent.setAttribute("data-pid", process._pid);

    target.append(row, indent);
  }

  segments() {
    const nameSegment = document.createElement("div");
    const titleSegment = document.createElement("div");
    const pidSegment = document.createElement("div");
    const idSegment = document.createElement("div");

    nameSegment.className = "segment name";
    titleSegment.className = "segment title";
    pidSegment.className = "segment pid";
    idSegment.className = "segment id";

    return { nameSegment, titleSegment, pidSegment, idSegment };
  }
}
