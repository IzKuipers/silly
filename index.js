import { app, BrowserWindow, globalShortcut } from "electron";

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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  window.removeMenu();
  window.loadFile("src/index.html");

  globalShortcut.register("Ctrl+Shift+Alt+I", () => {
    window.toggleDevTools();
  });
});
