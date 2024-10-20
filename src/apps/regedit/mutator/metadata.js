/* ! NOTE: External application, don't EVER load into the app store */
const RegEditMutatorApp = {
  metadata: {
    name: "Edit Value",
    version: "1.0.0",
    author: "Izaak Kuipers",
    icon: "./assets/apps/regedit.svg",
  },
  size: { w: 350, h: 250 },
  minSize: { w: 350, h: 250 },
  maxSize: { w: 350, h: 250 },
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
    js: "../../apps/regedit/mutator/mutator.js",
    css: "./css/apps/regedit/mutator.css",
    html: "./apps/regedit/mutator/mutator.html",
  },
  hidden: true,
  core: false,
  id: "regEditMutatorApp",
};

export default RegEditMutatorApp;
