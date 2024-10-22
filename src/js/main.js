import { IneptaKernel } from "./kernel/index.js";

// CODE EXECUTION STARTS HERE
export async function Main() {
  const kernel = new IneptaKernel();

  await kernel._init();
}

Main();
