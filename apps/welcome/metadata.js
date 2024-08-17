export const WelcomeApp = {
  metadata: {
    name: "Welcome to Inepta",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 350, h: 250 },
  minSize: { w: 350, h: 250 },
  maxSize: { w: 400, h: 300 },
  position: { x: 100, y: 100 },
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
    js: "/apps/welcome/welcome.js",
    css: "/css/apps/welcome.css",
    html: "/apps/welcome/welcome.html",
  },
  core: false,
  id: "welcomeApp",
};
