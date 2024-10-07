import { PREFERENCES_FILE } from "../../env.js";
import { Store } from "../store.js";
import fs from "../vfs.js";
import { DefaultUserData } from "./store.js";

export const UserData = Store(DefaultUserData);

export function startUserDataSync() {
  UserData.subscribe((v) => {
    fs.writeFile(PREFERENCES_FILE, JSON.stringify(v, null, 2));
  });
}
