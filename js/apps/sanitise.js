import { getJsonHierarchy } from "../hierarchy.js";

export const REQUIRED_PATHS = [
  "metadata",
  "metadata.name",
  "metadata.version",
  "metadata.author",
  "size",
  "size.w",
  "size.h",
  "minSize",
  "minSize.h",
  "maxSize",
  "maxSize.w",
  "maxSize.h",
  "position",
  "position.x",
  "position.y",
  "state",
  "state.resizable",
  "state.minimized",
  "state.maximized",
  "state.fullscreen",
  "controls",
  "controls.minimize",
  "controls.maximize",
  "controls.close",
  "files",
  "files.js",
  "files.css",
  "files.html",
  "id",
];

export function appDataComplete(data) {
  data = { ...data };

  for (const key of REQUIRED_PATHS) {
    const value = getJsonHierarchy(data, key);

    if (!(value ?? true)) return false;
  }

  return true;
}
