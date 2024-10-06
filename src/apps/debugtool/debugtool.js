import { AppProcess } from "../../js/apps/process.js";

export default class DebugToolProcess extends AppProcess {
  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }
}
