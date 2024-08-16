import { Log } from "../logging.js";
import { StateCodeExecution, StateProps } from "./store.js";
import { Sleep } from "../sleep.js";

export * from "./store.js";

export async function loadState(
  { html, css, js, name, identifier } = {},
  props = {}
) {
  if (!html || !css || !js || !name || !identifier)
    throw new Error("Attempted state load invocation without valid metadata");

  Log(`loadState`, `Loading state ${name} (${identifier})`);

  const { htmlLoader, cssLoader, jsLoader } = getStateLoaders();
  const CodeExecution = document.createElement("script");

  CodeExecution.type = "module";
  CodeExecution.async = true;
  CodeExecution.src = js;

  jsLoader.append(CodeExecution);

  cssLoader.href = css;
  StateProps[identifier] = props || {};

  Log(`loadState`, `${identifier}: Attempting to read HTML`);

  try {
    const htmlContents = await (await fetch(html)).text();

    htmlLoader.innerHTML = htmlContents;
    htmlLoader.className = `fullscreen ${identifier}`;
  } catch {
    throw new Error(`${identifier}: Failed to load state HTML`);
  }

  await Sleep(100);

  try {
    const execution = StateCodeExecution[identifier];

    if (!execution) return;

    Log(`loadState`, `${identifier}: Starting code execution`);

    await execution();
  } catch (e) {
    throw new Error(`${identifier}: ${e}`);
  }
}

export function getStateLoaders() {
  const cssLoader = document.getElementById("stateCSSLoader");
  const jsLoader = document.getElementById("stateJSLoader");
  const htmlLoader = document.getElementById("stateLoader");

  if (!cssLoader || !jsLoader || !htmlLoader)
    throw new Error("Missing elements of state handling.");

  return { htmlLoader, cssLoader, jsLoader };
}
