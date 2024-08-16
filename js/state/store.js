export const States = {
  boot: {
    js: "/state/boot/boot.js",
    css: "/state/boot/boot.css",
    html: "/state/boot/boot.html",
    name: "Boot",
    identifier: "boot-screen",
  },
  crash: {
    js: "/state/crash/crash.js",
    css: "/state/crash/crash.css",
    html: "/state/crash/crash.html",
    name: "Aw, snap!",
    identifier: "crash-screen",
  },
};

export const StateProps = {};
export const StateCodeExecution = {};

export function getStateProps(state) {
  const identifier = state.identifier;

  if (!identifier) return {};

  return StateProps[identifier] || {};
}
