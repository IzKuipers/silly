import { IneptaKernel } from "./kernel/index.js";

// CODE EXECUTION STARTS HERE
export async function Main() {
  // Create a new Inepta kernel
  const kernel = new IneptaKernel();

  // Initialize the kernel to jumpstart the code execution
  await kernel._init();
}

// Start code execution
Main();
