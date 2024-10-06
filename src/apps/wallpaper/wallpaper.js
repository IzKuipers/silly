import { AppRuntimeError } from "../../js/apps/error.js";
import { AppProcess } from "../../js/apps/process.js";
import { MessageBox } from "../../js/desktop/message.js";
import { MessageIcons } from "../../js/images/msgbox.js";

export default class WallpaperProcess extends AppProcess {
  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);
  }

  render() {
    const button = this.getElement("button#cssReloadHotfix", true);

    if (!button) throw new AppRuntimeError("No such element #cssReloadHotfix");

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
}
