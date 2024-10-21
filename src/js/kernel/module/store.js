import { ToolbarModule } from "../../electron/toolbar.js";
import { Environment } from "../../environment/index.js";
import { PowerLogic } from "../../power/index.js";
import { ProcessHandler } from "../../process/handler.js";
import { IneptaRegistry } from "../../registry/index.js";
import { ContextMenuLogic } from "../../ui/context/index.js";
import { UserLogic } from "../../user/index.js";
import { FileSystem } from "../../vfs.js";

export const CoreKernelModules = {
  fs: FileSystem,
  registry: IneptaRegistry,
  powerlogic: PowerLogic,
  toolbar: ToolbarModule,
  context: ContextMenuLogic,
  environment: Environment,
  userlogic: UserLogic,
  stack: ProcessHandler,
};
