export const LoginApp = {
  metadata: {
    name: "Log in to Inepta",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 420, h: 310 },
  minSize: { w: 420, h: 310 },
  maxSize: { w: 420, h: 310 },
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
    js: "../../apps/loginapp/loginapp.js",
    css: "./css/apps/loginapp.css",
    html: "./apps/loginapp/loginapp.html",
  },
  hidden: false,
  core: false,
  id: "loginApp",
};
