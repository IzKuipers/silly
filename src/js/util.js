export function htmlspecialchars(text) {
  const el = document.createElement("div");
  el.innerText = text;
  return el.innerHTML;
}
