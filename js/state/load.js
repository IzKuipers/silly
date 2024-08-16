import { Log } from "../logging.js";
import { Sleep } from "../sleep.js";
import { StateProps } from "./store.js";

export * from "./store.js";

let previousState = "";

export async function loadState(
  { html, css, js, name, identifier } = {},
  props = {}
) {
  if (!html || !css || !js || !name || !identifier)
    throw new Error("Attempted state load invocation without valid metadata");

  Log(`loadState`, `Loading state ${name} (${identifier})`);

  const { htmlLoader, cssLoader } = getStateLoaders();

  StateProps[identifier] = props || {};

  Log(`loadState`, `${identifier}: Attempting to read HTML`);

  htmlLoader.classList.add("hidden");

  await Sleep(400);

  try {
    const htmlContents = await (await fetch(html)).text();

    htmlLoader.innerHTML = htmlContents;
  } catch {
    throw new Error(`${identifier}: Failed to load state HTML`);
  }

  if (previousState) htmlLoader.classList.remove(previousState);

  htmlLoader.classList.add(`fullscreen`, identifier);
  cssLoader.href = css;

  await Sleep(500);

  htmlLoader.classList.remove("hidden");

  previousState = identifier;

  try {
    const { default: render } = await import(js);

    if (!render) return;

    Log(`loadState`, `${identifier}: Starting code execution`);

    await render();
  } catch (e) {
    throw new Error(`${identifier}: ${e}`);
  }
}

export function getStateLoaders() {
  const cssLoader = document.getElementById("stateCSSLoader");
  const htmlLoader = document.getElementById("stateLoader");

  if (!cssLoader || !htmlLoader)
    throw new Error("Missing elements of state handling.");

  return { htmlLoader, cssLoader };
}
