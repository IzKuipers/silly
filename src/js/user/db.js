import { KERNEL } from "../../env";

const initSqlJs = require("sql.js");

export class UserPreferences {
  fs;
  constructor(dbFilePath) {
    this.dbFilePath = dbFilePath;
    this.db = null;
    this.fs = KERNEL.getModule("fs");
  }

  async init() {
    const SQL = await initSqlJs();

    if (this.fs.existsSync(this.dbFilePath)) {
      const fileBuffer = fs.readFileSync(this.dbFilePath);

      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
      this.createTable();
    }
  }

  createTable() {
    const query = `
          CREATE TABLE IF NOT EXISTS preferences (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              itemName TEXT UNIQUE,
              value TEXT
          )
      `;

    this.db.run(query);
  }

  setPreference(itemName, value) {
    const query = `
          INSERT INTO preferences (itemName, value) 
          VALUES (?, ?)
          ON CONFLICT(itemName) DO UPDATE SET value = excluded.value
      `;
    const stmt = this.db.prepare(query);

    stmt.run([itemName, value]);
    stmt.free();
    this.save();
  }

  getPreference(itemName) {
    const query = `SELECT value FROM preferences WHERE itemName = ?`;
    const stmt = this.db.prepare(query);

    stmt.bind([itemName]);

    let result = null;

    while (stmt.step()) {
      result = stmt.getAsObject().value;
    }

    stmt.free();

    return result;
  }

  getAllPreferences() {
    const query = `SELECT itemName, value FROM preferences`;
    const stmt = this.db.prepare(query);

    let preferences = {};

    while (stmt.step()) {
      const row = stmt.getAsObject();
      preferences[row.itemName] = row.value;
    }

    stmt.free();

    return preferences;
  }

  save() {
    const data = this.db.export();

    KERNEL.fs.writeFileSync(this.dbFilePath, Buffer.from(data));
  }

  close() {
    this.db.close();
  }
}
