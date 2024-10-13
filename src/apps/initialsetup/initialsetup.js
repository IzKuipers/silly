import { VERSION } from "../../env.js";
import { AppProcess } from "../../js/apps/process.js";

export default class SetupHelperProcess extends AppProcess {
  pageIndex = 0;
  pageCount = 3;
  nextConditions = {
    page2: this.createFirstUser.bind(this),
  };

  constructor(handler, pid, parentPid, app) {
    super(handler, pid, parentPid, app);

    this.powerLogic = this.kernel.getModule("powerlogic");
    this.userlogic = this.kernel.getModule("userlogic");
  }

  render() {
    this.previousButton = this.getElement("#previous", true);
    this.nextButton = this.getElement("#next", true);
    this.shutdownButton = this.getElement("#shutdown", true);
    this.usernameField = this.getElement("#usernameField", true);
    this.passwordField = this.getElement("#passwordField", true);
    this.confirmField = this.getElement("#passwordConfirmField", true);

    this.pageIndex = 1;
    this.update();
    this.initActions();
  }

  initActions() {
    this.previousButton.addEventListener(
      "click",
      this.safe(() => {
        this.previous();
      })
    );

    this.nextButton.addEventListener(
      "click",
      this.safe(() => {
        this.next();
      })
    );

    this.shutdownButton.addEventListener(
      "click",
      this.safe(() => {
        this.powerLogic.shutdown();
      })
    );
  }

  update() {
    this.updatePages();
    this.updateActions();
  }

  updatePages() {
    const pages = this.getElements(".page");

    for (const page of pages) {
      if (page.id === `page${this.pageIndex}`) {
        page.classList.add("show");
      } else {
        page.classList.remove("show");
      }
    }

    this.updateActions();
  }

  updateActions() {
    const previous = this.getElement("#previous", true);
    const next = this.getElement("#next span.caption", true);

    previous.disabled = this.pageIndex <= 1;
    next.innerText = this.pageIndex >= this.pageCount ? "Finish" : "Next";
  }

  previous() {
    this.pageIndex--;
    this.update();
  }

  async next() {
    this.nextButton.disabled = true;

    const nextCondition = this.nextConditions[`page${this.pageIndex}`];

    if (nextCondition) {
      const result = await nextCondition();

      if (result !== true) {
        this.nextButton.disabled = false;

        return;
      }
    }

    this.pageIndex++;

    if (this.pageIndex > this.pageCount) {
      this.finish();

      return;
    }

    this.nextButton.disabled = false;

    this.update();
  }

  async createFirstUser() {
    console.log(
      "createFirstUser",
      this.usernameField.value,
      this.passwordField.value,
      this.confirmField.value
    );

    if (
      !this.usernameField.value ||
      !this.passwordField.value ||
      !this.confirmField.value
    )
      return;

    if (this.passwordField.value !== this.confirmField.value) return;

    this.usernameField.disabled = true;
    this.passwordField.disabled = true;
    this.confirmField.disabled = true;

    return true;
  }

  async finish() {
    await this.userlogic.createUser(
      this.usernameField.value,
      this.passwordField.value,
      true
    );

    this.registry.setValue("initialSetup.finishedAt", new Date().getTime());
    this.registry.setValue("initialSetup.doneBy", this.usernameField.value);
    this.registry.setValue("initialSetup.completed", true);
    this.registry.setValue("initialSetup.installVersion", VERSION);

    this.powerLogic.restart();
  }
}
