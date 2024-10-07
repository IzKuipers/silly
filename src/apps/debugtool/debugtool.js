import { AppRuntimeError } from "../../js/apps/error.js";
import { AppProcess } from "../../js/apps/process.js";
import { MessageBox } from "../../js/desktop/message.js";
import { MessageIcons } from "../../js/images/msgbox.js";

const { BrowserWindow } = require("@electron/remote");

export default class DebugToolProcess extends AppProcess {
  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  render() {
    this.cssHotFix();
    this.electronControls();
    this.pageReload();
  }

  cssHotFix() {
    const button = this.getElement("button#cssReloadHotfix", true);

    button.addEventListener("click", () => {
      const stylesheets = document.querySelectorAll("link[rel='stylesheet']");

      for (const stylesheet of stylesheets) {
        const href = stylesheet.href;

        stylesheet.href = "";

        setTimeout(() => {
          stylesheet.href = href;
          MessageBox({
            title: "CSS Reload Hotfix",
            message: `Reloaded stylesheet <b>${stylesheet.id}</b>:<br><br><code>${href}</code>`,
            icon: MessageIcons.information,
            buttons: [
              {
                caption: "Okay",
                action() {},
              },
            ],
          });
        });
      }
    });
  }

  pageReload() {
    const button = this.getElement("button#pageReload", true);

    button.addEventListener("click", () => {
      location.reload();
    });
  }

  electronControls() {
    const minimize = this.getElement("button#minimize", true);
    const maximize = this.getElement("button#maximize", true);
    const close = this.getElement("button#close", true);

    minimize.addEventListener("click", () => {
      if (!BrowserWindow.getFocusedWindow()) return;

      BrowserWindow.getFocusedWindow().minimize();
    });
    maximize.addEventListener("click", () => {
      if (!BrowserWindow.getFocusedWindow()) return;

      BrowserWindow.getFocusedWindow().maximize();
      BrowserWindow.getFocusedWindow().fullScreen = false;
    });
    close.addEventListener("click", () => {
      window.close();
    });
  }
}
