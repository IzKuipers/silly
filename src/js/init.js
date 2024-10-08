import { IneptaKernel } from "./kernel/index.js";
import { Log } from "./logging.js";

export async function Init() {
  Log("Init", "*** STARTING INEPTA ***");

  const kernel = new IneptaKernel();
  await kernel._init();
}

Init();
