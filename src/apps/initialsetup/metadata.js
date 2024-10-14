export const InitialSetupApp = {
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
    js: "../../apps/initialsetup/initialsetup.js",
    css: "./css/apps/initialsetup.css",
    html: "./apps/initialsetup/initialsetup.html",
  },
  hidden: true,
  core: false,
  id: "initialSetup",
};
