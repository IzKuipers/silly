import { IneptaKernel } from "./kernel/index.js";
import { Log } from "./logging.js";

// CODE EXECUTION STARTS HERE
export async function Main() {
  Log("Main", "*** STARTING INEPTA ***");

  const kernel = new IneptaKernel();
  await kernel._init();
}

Main();
