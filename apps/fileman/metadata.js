export const FileManApp = {
  metadata: {
    name: "File Manager",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 500, h: 450 },
  minSize: { w: 300, h: 250 },
  maxSize: { w: 1400, h: 1000 },
  position: { x: 100, y: 100, centered: true },
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
    js: "/apps/fileman/fileman.js",
    css: "/css/apps/fileman.css",
    html: "/apps/fileman/fileman.html",
  },
  core: false,
  id: "fileMan",
};
