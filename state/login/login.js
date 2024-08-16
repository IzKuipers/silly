import { States } from "../../js/init.js";
import { loadStateCode } from "../../js/state/exec.js";
import { UserData } from "../../js/user/data.js";
import { DefaultUserData } from "../../js/user/store.js";
import fs from "../../js/vfs.js";

loadStateCode(async function () {
  let userData = {};

  try {
    userData = JSON.parse(fs.readFile("user.txt"));
  } catch {
    userData = DefaultUserData;
    fs.createFile("user.txt", JSON.stringify(DefaultUserData));
  }

  UserData.set(userData);

  const nameElement = document.querySelector(".login #username");

  nameElement.innerText = userData.username || "Stranger";
}, States.login);
