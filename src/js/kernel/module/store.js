import { ProcessHandler } from "../../process/handler.js";
import { UserLogic } from "../../user/index.js";
import { VirtualFileSystem } from "../../vfs.js";

export const CoreKernelModules = {
  fs: VirtualFileSystem,
  userlogic: UserLogic,
  stack: ProcessHandler,
};
