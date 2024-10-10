import { ProcessHandler } from "../../process/handler.js";
import { VirtualFileSystem } from "../../vfs.js";

export const CoreKernelModules = {
  fs: VirtualFileSystem,
  stack: ProcessHandler,
};
