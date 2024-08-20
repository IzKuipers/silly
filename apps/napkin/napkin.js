import { AppProcess } from "../../js/apps/process.js";
import fs from "../../js/vfs.js";

export default class NapkinProcess extends AppProcess {
  path = "";
  constructor(handler, pid, parentPid, app, path) {
    super(handler, pid, parentPid, app);

    this.path = path || "";
    if (!this.path) return;

    app.data.metadata.name = `${this.path} - Napkin`;
  }

  render() {
    if (!this.path) return;

    const textarea = this.getElement("textarea", true);

    textarea.value = fs.readFile(this.path);
  }
}
