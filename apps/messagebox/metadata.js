export const MsgBoxApp = {
  metadata: {
    name: "MsgBox",
    version: "1.0.0",
    author: "Izaak Kuipers",
  },
  size: { w: 700, h: NaN },
  minSize: { w: 100, h: 50 },
  maxSize: { w: 1000, h: 700 },
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
    close: true,
  },
  files: {
    js: "/apps/messagebox/messagebox.js",
    css: "/css/apps/messagebox.css",
    html: "/apps/messagebox/messagebox.html",
  },
  hidden: true,
  core: false,
  id: "msgBox",
};
