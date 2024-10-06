import { AppRuntimeError } from "../../js/apps/error.js";
import { AppProcess } from "../../js/apps/process.js";

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
        });
      }
    });
  }
}
