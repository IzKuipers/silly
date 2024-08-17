import { Log } from "../logging.js";
import { Sleep } from "../sleep.js";
import { StateError } from "./error.js";
import { StateProps } from "./store.js";

export * from "./store.js";

let previousState = "";

export async function loadState(
  { html, css, js, name, identifier } = {},
  props = {},
  instant = false
) {
  if (!html || !css || !js || !name || !identifier)
    throw new StateError(
      "Attempted state load invocation without valid metadata"
    );

  const { htmlLoader, cssLoader } = getStateLoaders();

  StateProps[identifier] = props || {};

  if (!instant) {
    htmlLoader.classList.add("hidden");

    await Sleep(400);
  }

  try {
    const htmlContents = await (await fetch(html)).text();

    htmlLoader.innerHTML = htmlContents;
  } catch {
    throw new StateError(`${identifier}: Could not find required file ${html}`);
  }

  if (previousState) htmlLoader.classList.remove(previousState);

  htmlLoader.classList.add(`fullscreen`, identifier);
  cssLoader.href = css;

  if (!instant) {
    await Sleep(500);

    htmlLoader.classList.remove("hidden");
  }

  previousState = identifier;

  try {
    const { default: render } = await import(js);

    if (!render) throw new StateError(`${identifier}: No render function`);

    Log(`loadState`, `-> Now entering ${name}`);
    await render();
  } catch (e) {
    throw new StateError(`${identifier}: ${e.stack}`);
  }
}

export function getStateLoaders() {
  const cssLoader = document.getElementById("stateCSSLoader");
  const htmlLoader = document.getElementById("stateLoader");

  if (!cssLoader || !htmlLoader)
    throw new StateError("Missing elements of state handling.");

  return { htmlLoader, cssLoader };
}
