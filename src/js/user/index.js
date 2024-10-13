import { KernelModule } from "../kernel/module/index.js";
import { Store } from "../store.js";
import { DefaultUserData, DefaultUserPreferences } from "./store.js";

const { argon2i, hash, verify } = require("argon2");
const { join } = require("path");

export class UserLogic extends KernelModule {
  store = Store({});

  constructor(kernel, id) {
    super(kernel, id);
  }

  async _init() {
    this.fs = this._kernel.getModule("fs");
    this.registry = this._kernel.getModule("registry");

    await this.initialize();

    this.registry.setValue(
      "KERNEL.module.userlogic.loadTime.relative",
      this._kernel.startMs
    );

    this.registry.setValue(
      "KERNEL.module.userlogic.loadTime.absolute",
      new Date().getTime()
    );
  }

  async initialize() {
    await this._loadStore();
    this._startStoreSync();
  }

  async _loadStore() {
    try {
      const contents = this.fs.readFile("./users.json");

      this.store.set(JSON.parse(contents.toString()));
    } catch {
      this.store.set({});

      this.fs.writeFile("./users.json", JSON.stringify({}));
    }
  }

  _startStoreSync() {
    this.store.subscribe((v) => {
      this.fs.writeFile("./users.json", JSON.stringify(v));
    });
  }

  async createUser(username, password, admin = false) {
    username &&= username.toLowerCase();

    const store = this.store.get();

    if (store[username]) return false;

    store[username] = DefaultUserData;

    store[username].admin = admin;
    store[username].userFolder = `./Users/${username}`;
    store[username].username = username;
    store[username].password = await this.hashPassword(password);

    this.store.set(store);

    return await this.initializeUser(username);
  }

  getUser(username) {
    username &&= username.toLowerCase();

    const store = this.store.get();

    return store[username];
  }

  async initializeUser(username) {
    username &&= username.toLowerCase();

    const user = this.getUser(username);

    if (!user) return false;

    this.fs.createDirectory(user.userFolder);

    await this.initializePreferences(user);

    return true;
  }

  async initializePreferences(user) {
    user.username &&= user.username.toLowerCase();

    const preferencesPath = join(user.userFolder, "preferences.json");

    await this.fs.writeFile(
      preferencesPath,
      JSON.stringify(DefaultUserPreferences)
    );
  }

  async hashPassword(password) {
    // NOTE: Identical settings to password hashing in ArcOS Legacy
    return await hash(password, {
      type: argon2i,
      memoryCost: 2 ** 16,
      timeCost: 6,
      hashLength: 32,
    });
  }

  async verifyPassword(password, hash) {
    return verify(hash, password);
  }
}
