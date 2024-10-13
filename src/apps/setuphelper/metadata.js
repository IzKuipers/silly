export const SetupHelperApp = {
  metadata: {
    name: "Set up Inepta",
    version: "1.0.0",
    author: "Izaak Kuipers",
    icon: "./assets/inepta.png",
  },
  size: { w: 640, h: 480 },
  minSize: { w: 640, h: 480 },
  maxSize: { w: 640, h: 480 },
  position: { centered: true },
  state: {
    resizable: false,
    minimized: false,
    maximized: false,
    fullscreen: false,
  },
  controls: {
    minimize: false,
    maximize: false,
    close: false,
  },
  files: {
    js: "../../apps/setuphelper/setuphelper.js",
    css: "./css/apps/setuphelper.css",
    html: "./apps/setuphelper/setuphelper.html",
  },
  hidden: true,
  core: false,
  id: "setupHelper",
};
