import { FileManApp } from "../../apps/fileman/metadata.js";
import { MsgBoxApp } from "../../apps/messagebox/metadata.js";
import { NapkinApp } from "../../apps/napkin/metadata.js";
import { ShellApp } from "../../apps/shell/metadata.js";
import { WallpaperApp } from "../../apps/wallpaper/metadata.js";
import { WelcomeApp } from "../../apps/welcome/metadata.js";
import { Store } from "../store.js";

export const AppStore = Store({});

export const builtInApps = [
  MsgBoxApp,
  WallpaperApp,
  ShellApp,
  WelcomeApp,
  FileManApp,
  NapkinApp,
];
