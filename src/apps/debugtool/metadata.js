export const DebugToolApp = {
  metadata: {
    name: "Debug Tool",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 500, h: 400 },
  minSize: { w: 500, h: 400 },
  maxSize: { w: 500, h: 400 },
  position: { centered: true },
  state: {
    resizable: false,
    minimized: false,
    maximized: false,
    fullscreen: false,
  },
  controls: {
    minimize: true,
    maximize: false,
    close: true,
  },
  files: {
    js: "../../apps/debugtool/debugtool.js",
    css: "./css/apps/debugtool.css",
    html: "./apps/debugtool/debugtool.html",
  },
  hidden: false,
  core: false,
  id: "debugTool",
};
