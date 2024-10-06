export const WelcomeApp = {
  metadata: {
    name: "Welcome to Inepta",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 500, h: 450 },
  minSize: { w: 500, h: 450 },
  maxSize: { w: 600, h: 550 },
  position: { x: 100, y: 100, centered: true },
  state: {
    resizable: true,
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
    js: "../../apps/welcome/welcome.js",
    css: "./css/apps/welcome.css",
    html: "./apps/welcome/welcome.html",
  },
  autoRun: true,
  hidden: true,
  core: false,
  id: "welcomeApp",
};
