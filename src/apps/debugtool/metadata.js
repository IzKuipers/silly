export const DebugToolApp = {
  metadata: {
    name: "Debug Tool",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 750, h: 500 },
  minSize: { w: 750, h: 500 },
  maxSize: { w: 750, h: 1000 },
  position: { centered: true },
  state: {
    resizable: true,
    minimized: false,
    maximized: false,
    fullscreen: false,
  },
  controls: {
    minimize: true,
    maximize: true,
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
