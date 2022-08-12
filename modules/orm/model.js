import moment from "moment-timezone";
import { getTableName } from "../global/get-name";
import _ from "lodash";
import QueryBuilder from "./adapters/mysql/builders/query.builder";

export default class Model extends QueryBuilder {
  static snakeCase = true;
  static tableName = null;

  // PRIMARY KEYS
  static primaryKey = "id";
  static incrementing = true;
  static keyType = "int";

  //TIMESTAMPS
  static timestamps = true;
  static dateFormat = "TIMESTAMP"; // [Use Moment JS Format](https://momentjs.com/docs/#/displaying/format/)
  static createdAt = "created_at"; // If null not set on query
  static updatedAt = "updated_at"; // If null not set on query
  static timezone = null;

  // DB CONNECTION
  static connection = "default";

  // Logical Delete
  static logicalDelete = false;
  static deleted = "deleted";
  static deletedAt = "deleted_at";
  static deletedBy = "deleted_by";

  static casts = {};

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
