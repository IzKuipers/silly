import { PREFERENCES_FILE } from "../../env.js";
import { loadState, States } from "../../js/init.js";
import { Log } from "../../js/logging.js";
import { Sleep } from "../../js/sleep.js";
import { UserData } from "../../js/user/data.js";
import { DefaultUserData } from "../../js/user/store.js";
import fs from "../../js/vfs.js";

export default async function render() {
  let userData = {};

  try {
    userData = JSON.parse(fs.readFile(PREFERENCES_FILE));

    Log(`Login`, "Loaded User Data");
  } catch {
    userData = DefaultUserData;
    fs.writeFile(PREFERENCES_FILE, JSON.stringify(DefaultUserData));
  }

  UserData.set(userData);

  const nameElement = document.querySelector(".login #username");

  nameElement.innerText = userData.username || "Stranger";

  await Sleep(1000);

  loadState(States.desktop);
}
