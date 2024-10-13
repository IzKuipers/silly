import { PowerLogic } from "../../power/index.js";
import { ProcessHandler } from "../../process/handler.js";
import { UserLogic } from "../../user/index.js";
import { FileSystem } from "../../vfs.js";

export const CoreKernelModules = {
  fs: FileSystem,
  userlogic: UserLogic,
  stack: ProcessHandler,
  powerlogic: PowerLogic,
};
