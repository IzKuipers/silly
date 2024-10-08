import { app, BrowserWindow, globalShortcut, webContents } from "electron";
import { VERSION } from "./src/env.js";
import remote from "@electron/remote/main/index.js";

remote.initialize();
// remote.enable(webContents);

let window;

app.on("ready", () => {
  window = new BrowserWindow({
    width: 1024,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    center: true,
    backgroundColor: "#000",
    title: `Inepta ${VERSION}`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  remote.enable(window.webContents);

  window.removeMenu();
  window.loadFile("src/index.html");

  window.on("maximize", () => {
    window.unmaximize();
    setTimeout(() => {
      window.fullScreen = true;
    });
  });

  window.webContents.session.webRequest.onHeadersReceived(
    { urls: ["*://*/*"] },
    (d, c) => {
      if (d.responseHeaders["X-Frame-Options"]) {
        delete d.responseHeaders["X-Frame-Options"];
      } else if (d.responseHeaders["x-frame-options"]) {
        delete d.responseHeaders["x-frame-options"];
      }

      c({ cancel: false, responseHeaders: d.responseHeaders });
    }
  );

  globalShortcut.register("Ctrl+Shift+Alt+I", () => {
    window.toggleDevTools();
  });

  globalShortcut.register("Alt+Enter", () => {
    window.fullScreen = !window.fullScreen;
  });
});
