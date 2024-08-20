export const NapkinApp = {
  metadata: {
    name: "Napkin",
    version: "1.0.0",
    author: "Izaak Kuipers",
    icon: "/assets/silly.png",
  },
  size: { w: 400, h: 250 },
  minSize: { w: 300, h: 250 },
  maxSize: { w: 1400, h: 1000 },
  position: { x: 150, y: 150 },
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
    js: "/apps/napkin/napkin.js",
    css: "/css/apps/napkin.css",
    html: "/apps/napkin/napkin.html",
  },
  core: false,
  id: "napkinText",
};
