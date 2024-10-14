import { DebugToolApp } from "../../apps/debugtool/metadata.js";
import { MsgBoxApp } from "../../apps/messagebox/metadata.js";
import { ProgManApp } from "../../apps/progman/metadata.js";
import { RegEditApp } from "../../apps/regedit/metadata.js";
import { ShellApp } from "../../apps/shell/metadata.js";
import { WallpaperApp } from "../../apps/wallpaper/metadata.js";
import { Store } from "../store.js";

export const AppStore = Store({});

export const builtInApps = [
  MsgBoxApp,
  ShellApp,
  WallpaperApp,
  DebugToolApp,
  ProgManApp,
  RegEditApp,
];
