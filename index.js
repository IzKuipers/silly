import { app, BrowserWindow, globalShortcut } from "electron";
import { join } from "path";

let window;

app.on("ready", () => {
  window = new BrowserWindow({
    width: 1024,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    center: true,
    backgroundColor: "#000",
    title: "Inepta",
  });

  window.removeMenu();
  window.loadFile("src/index.html");

  globalShortcut.register("Ctrl+Shift+Alt+I", () => {
    window.toggleDevTools();
  });
});
