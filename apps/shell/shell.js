import { AppProcess } from "../../js/apps/process.js";

export default class ShellProcess extends AppProcess {
  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  start() {}

  stop() {}
}
