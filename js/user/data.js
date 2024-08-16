import { Store } from "../store.js";
import { DefaultUserData } from "./store.js";

export const UserData = Store(DefaultUserData);

UserData.subscribe((v) => {
  if (!v) return;

  // fs.createFile("user.txt", JSON.stringify(v));
});
