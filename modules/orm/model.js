import moment from "moment-timezone";
import _ from "lodash";
import QueryBuilder from "./adapters/mysql/builders/query.builder";

export default class Model {
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

  options = {}

  constructor() {
    this.model = this.constructor;
    return new Proxy(this, {
      get: function get(_class, method) {
        if (method in _class) return _class[method];
        return new QueryBuilder(_class.model)[method]
      },
    });
  }

  /**
   * Execute a SQL query. In order to avoid SQL Injection attacks, you should always escape any user provided data before using it inside a SQL query.
   * @param {string} sql - SQL query, use "?" instead of values to use escaping method.
   * @param {array} values - These values will be used to be replaced in the escaping method.
   * @returns
   */
  static sql(sql, values = []) {
    return new this().sql(sql, values);
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
        this.dateFormat != "TIMESTAMP" ? this.dateFormat : "YYYY-MM-DD HH:mm:ss"
      );
    return date;
  }

  static getDateFormat() {
    return this.dateFormat != "TIMESTAMP"
      ? this.dateFormat
      : "YYYY-MM-DD HH:mm:ss";
  }
}
