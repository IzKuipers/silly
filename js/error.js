import { Crash } from "./crash.js";

export function handleGlobalErrors() {
  function error(e) {
    e.preventDefault();

    Crash(e);

    console.trace();

    return true;
  }

  window.addEventListener("error", error, { passive: false });
  window.addEventListener("unhandledrejection", error, { passive: false });
}
