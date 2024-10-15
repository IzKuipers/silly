export const DebugToolApp = {
  metadata: {
    name: "Debug Tool",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 600, h: 145 },
  minSize: { w: 600, h: 145 },
  maxSize: { w: 600, h: 145 },
  position: { x: 30, y: 30 },
  state: {
    resizable: false,
    minimized: false,
    maximized: false,
    fullscreen: false,
  },
  controls: {
    minimize: false,
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
