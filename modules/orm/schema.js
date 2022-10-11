import { logPlugin } from "@babel/preset-env/lib/debug";
import { resolve } from "app-root-path";
import moment from "moment";
import adapter from "./adapters";
import SchemaBuilder from "./adapters/mysql/builders/schema.builder";
import { dbConfig } from "./adapters";
// import { getTableName, getFieldName } from "../global/get-name";

export default class Schema extends SchemaBuilder {
  static tableName = null;
  static connection = "default";
  static timestamps = false;

  constructor() {
    if (typeof this.constructor.run === "undefined")
      throw Error(`Method [run] missing from ${this.constructor.name}`);

    return this.container
      ? this.container.call([this, "run"])
      : this.constructor.run();
  }

  static get getConnection() {
    return dbConfig(this.connection);
  }

  static create(tableName, action) {
    this.tableName = tableName;
    this.schemaBuilder = SchemaBuilder;
    action(this.schemaBuilder);

    try {
      const create = adapter(this).createTable(this.schemaBuilder);
      this.schemaBuilder.init();
      return create;
    } catch (err) {
      throw err;
    }
  }

  static dropIfExists(tableName) {
    return this.drop(tableName, true);
  }

  static drop(tableName, ifExists = false) {
    this.tableName = tableName;
    this.schemaBuilder = SchemaBuilder;
    this.schemaBuilder.options.ifExists = ifExists;

    try {
      let dropTable = adapter(this).dropTable(this.schemaBuilder);
      this.schemaBuilder.init();
      return dropTable;
    } catch (err) {
      return err;
    }
  }

  static table(tableName, action) {
    this.tableName = tableName;
    this.schemaBuilder = SchemaBuilder;
    action(this.schemaBuilder);

    try {
      const alterTable = adapter(this).alterTable(this.schemaBuilder);
      this.schemaBuilder.init();
      return alterTable;
    } catch (err) {
      throw err;
    }
  }

  static get getTimezone() {
    return (
      this.timezone || global.TZ || process.env.TZ || "America/Los_Angeles"
    );
  }

  static get currentDate() {
    return this.formatDate();
  }

  static formatDate(date, notFormat = false) {
    date = moment(date).tz(this.getTimezone);
    if (!notFormat)
      date = date.format(
        notFormat
          ? ""
          : this.dateFormat != "TIMESTAMP"
          ? this.dateFormat
          : "YYYY-MM-DD HH:mm:ss"
      );
    return date;
  }

  static getDateFormat() {
    return this.dateFormat != "TIMESTAMP"
      ? this.dateFormat
      : "YYYY-MM-DD HH:mm:ss";
  }
}
