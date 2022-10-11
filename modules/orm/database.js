import Model from "./model";
import adapter from "./adapters";
import moment from "moment";

export default class DB extends Model {
  static timestamps = true;
  static connection = "default";
  static sync = true;
  static queryLog = [];
  static loggingQueries = false;

  // static table(tableName) {
  //   this.tableName = tableName;
  //   return adapter(this).queryBuilder({
  //     model: this,
  //     sync: this.sync,
  //   });
  // }

  static connection(connection) {
    this.connection = connection;
    return adapter(this).queryBuilder({
      model: this,
      sync: this.sync,
    });
  }

  // static truncate(tableName) {
  //   this.tableName = tableName;
  //   return adapter(this).truncateTable(this);
  // }

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

  static enableQueryLog() {
    this.loggingQueries = true;
  }

  static logQuery(query, bindings, time = null) {
    if (this.loggingQueries) this.queryLog.push({ query, bindings, time });
  }

  static getQueryLog() {
    return this.queryLog;
  }

  static getDifferenceDate(start, end) {
    const duration = moment.duration(end.diff(start));
    return duration.milliseconds() + " ms";
  }
}
