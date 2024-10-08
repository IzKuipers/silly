import { KERNEL, PREFERENCES_FILE } from "../../env.js";
import { Store } from "../store.js";

import { DefaultUserData } from "./store.js";

export const UserData = Store(DefaultUserData);

export function startUserDataSync() {
  UserData.subscribe((v) => {
    KERNEL.fs.writeFile(PREFERENCES_FILE, JSON.stringify(v, null, 2));
  });
}
