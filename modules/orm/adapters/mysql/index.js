import mysql from "mysql";
import _ from "lodash";
import { connect, format as formatSQL } from "./connection";
import SchemaBuilder from "./builders/schema.builder";
import FakerBuilder from "./builders/faker.builder";
import QueryBuilder from "./builders/query.builder";
import { DB } from "/";

class MysqlAdapter {
  model = null;
  joins = null;
  supportedCastTypes = {
    array: (val) => val.split(","),
    boolean: (val) => Boolean(val),
    date: (val) => this.model.model.formatDate(val),
    datetime: (val) => this.model.model.formatDate(val),
    decimal: (val) => parseFloat(val),
    double: (val) => parseFloat(val),
    float: (val) => parseFloat(val),
    integer: (val) => parseInt(val),
    object: (val) => JSON.parse(val),
    string: (val) => String(val),
    timestamp: (val) => this.model.model.formatDate(val),
  };
  log = {
    sql: null,
    bindings: [],
    time: { start: null, end: null },
  };

  setModel(model) {
    this.log.time.start = model.model.formatDate(new Date(), true);
    this.model = model;
    this.options = model.options;
    this.init = model.init;
  }

  /**
   *
   * @param {Object} SqlOptions
   * @param { String } SqlOptions.sql
   * @param { Array } SqlOptions.values
   * @returns MySQL Collection
   * @throws Promise rejection
   */
  sql(
    { sql, values, nestTables = true, format = false, direct = false },
    formatResponse
  ) {
    return new Promise((resolve, reject) => {
      const _reject = (err) => {
        this.init();
        return reject(err);
      };

      const _resolve = (res) => {
        this.init();
        return resolve(res);
      };

      const connection = connect();
      this.log.sql = sql;
      this.log.bindings = values;
      if (format) sql = formatSQL(sql);
      connection.query(
        {
          sql,
          nestTables,
          values,
        },
        (err, res, fields) => {
          if (direct && this.model.tableName != fields[0].table)
            this.model.table(fields[0].table);
          connection.end();
          this.log.time.end = this.model.model.formatDate(new Date(), true);
          DB.logQuery(
            this.log.sql,
            this.log.bindings,
            DB.getDifferenceDate(this.log.time.start, this.log.time.end)
          );
          if (err) _reject(err);
          try {
            if (nestTables) res = this.processNestTables(res);
            if (formatResponse) res = formatResponse(res);
            if (
              this.model.model.casts &&
              Object.entries(this.model.model.casts).length > 0
            )
              res = this.processCasts(res);
            _resolve(res);
          } catch (err) {
            _reject(err);
          }
        }
      );
    });
  }

  all() {
    const { sql } = this.processSQL();
    return this.sql({ sql });
  }

  first(formatResponse = undefined) {
    this.options.limit = 1;
    const { sql, values } = this.processSQL();
    return this.sql(
      { sql, values, nestTables: false },
      formatResponse ?? ((res) => res[0])
    );
  }

  last() {
    this.options = { orderBy: [this.model.model.primaryKey, "DESC"], limit: 1 };
    const { sql } = this.processSQL();
    return this.sql({ sql });
  }

  count() {
    this.options.select = [`COUNT(*) as count`];
    const { sql, values } = this.processSQL();
    return this.sql({ sql, values, nestTables: false }, (res) => {
      return res[0].count;
    });
  }

  max(column) {
    this.options.select = [`MAX(${column}) as max`];
    const { sql } = this.processSQL();
    return this.sql({ sql, nestTables: false }, (res) => {
      return res[0].max;
    });
  }

  min(column) {
    this.options.select = [`MIN(${column}) as min`];
    const { sql } = this.processSQL();
    return this.sql({ sql, nestTables: false }, (res) => {
      return res[0].min;
    });
  }

  sum(column) {
    this.options.select = [`SUM(${column}) as sum`];
    const { sql } = this.processSQL();
    return this.sql({ sql, nestTables: false }, (res) => {
      return res[0].sum;
    });
  }

  avg(column) {
    this.options.select = [`AVG(${column}) as avg`];
    const { sql } = this.processSQL();
    return this.sql({ sql, nestTables: false }, (res) => {
      return res[0].avg;
    });
  }

  get() {
    const { sql, values } = this.processSQL();
    return this.sql({ sql, values });
  }

  toSql(showValues = false, type = "select") {
    return new Promise((resolve, reject) => {
      try {
        let { sql, values } = this.processSQL(type);
        if (showValues) sql = mysql.format(sql, values);
        this.init();
        resolve(sql);
      } catch (error) {
        reject(error);
      }
    });
  }

  value() {
    return this.first((res) => {
      return res[0].username;
    });
  }

  update() {
    const { sql, values } = this.processSQL("update");
    return this.sql({ sql, values, nestTables: false });
  }

  insert() {
    const { sql, values } = this.processSQL("insert");
    return this.sql({ sql, values, nestTables: false });
  }

  delete() {
    const { sql, values } = this.processSQL("delete");
    return this.sql({ sql, values, nestTables: false });
  }

  truncate() {
    const { sql } = this.processSQL("truncate");
    return this.sql({ sql, nestTables: false });
  }

  createTable({
    options: { fields },
    getCharset: charset,
    getEngine: engine,
    getCollation: collation,
  }) {
    fields = this.processFields(fields).join(", ");
    const sql = `CREATE TABLE ${this.model.getTableName} (${fields}) DEFAULT CHARACTER SET ${charset} COLLATE '${collation}' ENGINE = ${engine}`;
    return this.sql({ sql, format: true });
  }

  alterTable({ options: { fields, drop, column, ...options } }) {
    fields = this.processFields(fields).join(", ");
    let modify = /(modify|rename) column/i.test(fields);
    if (drop) fields = `\`${column}\``;
    const sql = `ALTER TABLE ${this.model.getTableName} ${
      modify ? "" : `${drop ? "DROP" : "ADD"} COLUMN `
    }${fields}`;
    return this.sql({ sql, format: true });
  }

  dropTable({ options: { ifExists } }) {
    let sql = `DROP TABLE ${ifExists === true ? "IF EXISTS " : ""}${
      this.model.getTableName
    }`;
    return this.sql({ sql, format: true });
  }

  /*
    returns a new schema builder instance
  */

  queryBuilder(options = {}) {
    return new QueryBuilder(options);
  }

  schemaBuilder(options = {}) {
    return new SchemaBuilder(options);
  }

  /*
    returns a new faker builder instance
  */
  fakerBuilder(options) {
    return new FakerBuilder(options);
  }

  processSQL(type = "select") {
    const model = this.model;
    let sql = "";
    let { joins, values: joinValues } = this.processJoins();
    let { where, values } = this.processWhere(model.options?.where);
    const limit = `${
      model.options?.limit ? ` LIMIT ${model.options.limit}` : ""
    }`;
    const offset = `${
      model.options?.offset ? ` OFFSET ${model.options.offset}` : ""
    }`;
    const orderBy = this.processOrderBy();
    const groupBy = this.processGroupBy();

    let { columns, values: updateValues } = ["update", "insert"].includes(type)
      ? this.processColumns(type)
      : { columns: "", values: [] };
    switch (type) {
      case "update":
        values = [...updateValues, ...values];
        sql = `UPDATE ${model.getTableName} SET ${columns}${joins}${where}${orderBy}${limit}${offset}`;
        break;
      case "insert":
        values = [...updateValues, ...values];
        sql = `INSERT INTO ${model.getTableName} ${columns}`;
        break;
      case "delete":
        sql = `DELETE FROM ${model.getTableName}${joins}${where}${groupBy}${orderBy}${limit}${offset}`;
        break;
      case "truncate":
        values = [...updateValues, ...values];
        sql = `TRUNCATE TABLE ${model.getTableName}`;
        break;
      default:
        sql = `SELECT ${this.processSelect(model.options?.select)} FROM ${
          model.getTableName
        }${joins}${where}${groupBy}${orderBy}${limit}${offset}`;
    }
    return { sql, values };
  }

  processColumns(type = "update") {
    let { set } = this.options;
    set = set ?? [];
    if (!Array.isArray(set)) set = [set];
    let columns = _.uniq(
      _.flatten(
        set.map((item) => {
          let keys = Object.keys(item);
          if (this.model.getTimestamps) {
            if (type === "update") keys.push(this.model.getUpdatedAt);
            if (type === "insert") keys.push(this.model.getCreatedAt);
          }
          return keys;
        })
      )
    );
    let values = [
      set.map((item) => {
        let values = Object.values(item);
        if (this.model.getTimestamps) {
          values.push(this.model.model.currentDate);
        }
        return values;
      }),
    ];
    if (type === "insert") columns = `(\`${columns.join("`, `")}\`) VALUES ?`;
    if (type === "update") columns = `SET \`${columns.join("` = ?, `")}\` = ?`;

    return {
      columns,
      values,
    };
  }

  processSelect(select) {
    return !select || select.length == 0
      ? "*"
      : `${select
          .map((s) => {
            if (/ as /gi.test(s)) {
              s = s.split(/ as /gi);
              s = `${/\(/gi.test(s[0]) ? `${s[0]}` : `\`${s[0]}\``} AS \`${
                s[1]
              }\``;
            } else {
              s = `\`${s}\``;
            }
            return s;
          })
          .join(", ")}`;
  }

  processWhere(where) {
    if (!where || where.length === 0) return { where: "", values: [] };
    let values = [];
    where = where
      .map((item, ind) => {
        let {
          column,
          operator,
          value,
          orWhere: or,
          separator,
          parenthesis,
          isFunction,
        } = item;

        if (typeof column === "object") {
          let isOr = false;
          item = `(${item
            .map((item, idx) => {
              let {
                column,
                operator,
                value,
                orWhere,
                separator,
                parenthesis,
                isFunction,
              } = item;

              isOr = orWhere;
              if (Array.isArray(value)) values = [...values, ...value];
              else values.push(value);
              value = Array.isArray(value)
                ? `${parenthesis ? "(" : ""}${value
                    .map(() => "?")
                    .join(separator)}${parenthesis ? ")" : ""}`
                : value
                ? "?"
                : "";
              if (isFunction)
                return `${idx !== 0 ? "AND " : ""}${isFunction}(\`${column}\`${
                  !operator ? `, ${value}` : ""
                })${operator ? ` ${operator} ${value}` : ""}`;
              return `${
                idx !== 0 ? "AND " : ""
              }\`${column}\` ${operator} ${value}`;
            })
            .join(" ")})`;
          return `${ind !== 0 ? (isOr ? "OR " : "AND ") : ""}${item}`;
        } else {
          if (Array.isArray(value)) values = [...values, ...value];
          else values.push(value);
          value = Array.isArray(value)
            ? `${parenthesis ? "(" : ""}${value
                .map(() => "?")
                .join(separator)}${parenthesis ? ")" : ""}`
            : value
            ? "?"
            : "";
          if (isFunction)
            return `${
              ind !== 0 ? (or ? "OR " : "AND ") : ""
            }${isFunction}(\`${column}\`${!operator ? `, ${value}` : ""})${
              operator ? ` ${operator} ${value}` : ""
            }`;
          return `${
            ind !== 0 ? (or ? "OR " : "AND ") : ""
          }\`${column}\` ${operator} ${
            Array.isArray(value)
              ? `${parenthesis ? "(" : ""}${value
                  .map(() => "?")
                  .join(separator)}${parenthesis ? ")" : ""}`
              : value
              ? "?"
              : ""
          }`;
        }
      })
      .join(" ");
    where = ` WHERE ${where}`;
    values = values.filter((ele) => ele);
    return { where, values };
  }

  processJoins() {
    const values = [];
    if (!this.options?.joins) return { joins: "", values };
    let joins = this.options.joins.map(
      ({ table, first, operator, second, type, where }) => {
        table = `${table.replaceAll(/\`/gi, "").split(".").join("`.`")}`;
        if (/ as /gi.test(table)) {
          table = table.split(/ as /gi);
          table = `${
            /\(/gi.test(table[0]) ? `${table[0]}` : `\`${table[0]}\``
          } AS \`${table[1]}\``;
        } else {
          table = `\`${table}\``;
        }
        first = `${first.replaceAll(/\`/gi, "").split(".").join("`.`")}`;
        second = `${second.replaceAll(/\`/gi, "").split(".").join("`.`")}`;
        if (where) values.push(where);
        return `${type.toUpperCase()} JOIN ${table} ON \`${first}\` ${operator} ${
          where ? "?" : `\`${second}\``
        }`;
      }
    );
    if (joins.length > 0) joins = ` ${joins.join(" ")}`;
    return { joins, values };
  }

  processGroupBy() {
    let { groupBy } = this.options;
    if (!groupBy || groupBy.length === 0) return "";
    groupBy = groupBy.map((group) => {
      return `${/\`/.test(group) ? group : `\`${group}\``}`;
    });
    return ` GROUP BY ${groupBy.join(", ")}`;
  }

  processOrderBy() {
    let { orderBy } = this.options;
    if (!orderBy || orderBy.length === 0) return "";
    orderBy = orderBy.map((order) => {
      return `${/\`/.test(order[0]) ? order[0] : `\`${order[0]}\``} ${
        order[1]
      }`;
    });
    return ` ORDER BY ${orderBy.join(", ")}`;
  }

  processNestTables(response) {
    if (
      response.constructor.name == "OkPacket" ||
      (Array.isArray(response) && response.length === 0)
    )
      return response;
    if (
      response[0] &&
      Object.keys(response[0]).findIndex((ele) =>
        ["max", "min", "sum", "avg", "count"].includes(ele)
      ) >= 0
    )
      return response;

    let tableName = this.model.getTableName.replaceAll(/\`/gi, "").split(".");
    tableName = tableName[tableName.length - 1];
    const newResponse = [];
    response.map((res) => {
      Object.entries(res).map((obj) => {
        const [key, val] = obj;
        let idx;
        if (key === tableName) {
          idx = newResponse.findIndex((ele) =>
            ele[this.model.model.primaryKey]
              ? ele[this.model.model.primaryKey] ===
                val[this.model.model.primaryKey]
              : false
          );
          if (idx < 0) return newResponse.push(val);
          else return;
        }
        const ind = idx >= 0 ? idx : newResponse.length - 1;
        if (ind >= 0) {
          if (!newResponse[ind][key]) newResponse[ind][key] = [];
          if (Object.entries(val).filter((obj) => obj[1]).length === 0) return;
          newResponse[ind][key].push(val);
        }
      });
    });
    return newResponse;
  }

  processCasts(response) {
    const { casts } = this.model;
    if (typeof response !== "object" || !Array.isArray(response) || !casts)
      return response;
    response.map((res) => {
      Object.entries(casts).map((cast) => {
        if (res[cast[0]])
          res[cast[0]] = this.supportedCastTypes[cast[1]](res[cast[0]]);
      });
    });
    return response;
  }

  processFields(fields) {
    let uniques = [];
    let primaries = [];
    if (!fields) return [];
    fields = fields.map((field) => {
      if (field.primary) primaries.push(`\`${field.name}\``);
      if (field.unique) uniques.push(`\`${field.name}\``);

      let str = [];
      str.push(
        `${
          field.modify ? `${field.rename ? "RENAME" : "MODIFY"} COLUMN ` : ""
        }\`${field.name}\`${
          field.type && !field.rename ? ` ${field.type}` : ""
        }`
      );
      if (!field.rename) {
        if (field.length && field.length > 0) str.push(`(${field.length})`);
        if (field.unsigned) str.push("UNSIGNED");
        if (field.nullable) str.push("NULL");
        else str.push("NOT NULL");
        if (field.auto_increment) str.push("AUTO_INCREMENT");
        if (field.default)
          str.push(
            `DEFAULT ${
              ["CURRENT_TIMESTAMP", "GETDATE()"].includes(field.default)
                ? field.default
                : `'${field.default}'`
            }`
          );
        if (field.comment) str.push(`COMMENT '${field.comment}'`);
        if (field.after) str.push(`AFTER \`${field.after}\``);
      }

      if (field.rename) str.push(`TO \`${field.rename}\``);

      return str.join(" ").trim();
    });

    if (uniques.length > 0) fields.push(`UNIQUE (${uniques.join(", ")})`);
    if (primaries.length > 0)
      fields.push(`PRIMARY KEY (${primaries.join(", ")})`);
    return fields;
  }
}

export default new MysqlAdapter();
