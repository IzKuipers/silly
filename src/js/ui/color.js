const colorsea = require("colorsea");

export function getAccentColorVariations(accent) {
  const sea = colorsea(accent);

  const light = sea.lighten(32.5, "relative").hex();
  const dark = sea.darken(26.5, "relative").hex();
  const darker = sea.darken(39, "relative").hex();
  const superdark = sea.darken(77, "relative").hex();
  const start = sea.transparentize(78, "relative").hex();
  const startHover = sea.transparentize(60, "relative").hex();
  const startActive = sea.transparentize(85, "relative").hex();

  return {
    light,
    dark,
    darker,
    superdark,
    accent,
    start,
    startHover,
    startActive,
  };
}
