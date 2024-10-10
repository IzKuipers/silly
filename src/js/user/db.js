const initSqlJs = require("sql.js");

export class UserDatabase {
  constructor(username) {
    this._init();
  }

  async _init() {
    this.sql = await initSqlJs();
    const db = new this.sql.Database();

    // db.
  }
}
