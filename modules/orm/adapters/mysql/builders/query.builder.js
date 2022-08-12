import adapter from "orm/adapters";
import { getTableName } from "global/get-name";
import _ from "lodash";
import url from "url";

export default class QueryBuilder {
  static options = {};
  static get operators() {
    return [
      "=",
      "<",
      ">",
      "<=",
      ">=",
      "<>",
      "!=",
      "<=>",
      "like",
      "like binary",
      "not like",
      "ilike",
      "&",
      "|",
      "^",
      "<<",
      ">>",
      "rlike",
      "not rlike",
      "regexp",
      "not regexp",
      "~",
      "~*",
      "!~",
      "!~*",
      "similar to",
      "not similar to",
      "not ilike",
      "~~*",
      "!~~*",
      "in",
      "not in",
      "is null",
      "is not null",
      "between",
      "not between",
      "json_contains",
      "not json_contains",
      "json_length",
      "not json_length",
      null,
    ];
  }

  /**
   * Execute a SQL query. In order to avoid SQL Injection attacks, you should always escape any user provided data before using it inside a SQL query.
   * @param {*} sql - SQL query, use "?" instead of values to use escaping method.
   * @param {*} values - These values will be used to be replaced in the escaping method.
   * @returns
   */
  static sql(sql, values = []) {
    this.setModel(this);
    return adapter(this.options.model ?? this).sql({ sql, values });
  }

  /**
   * The Obremap all() method will return all of the results in the model's table. Since each Obremap model serves as a query builder,
   * you may also add constraints to queries, and then use the get method to retrieve the results.
   * @returns Obremap Collection
   */
  static all() {
    this.setModel(this);
    return adapter(this.options.model ?? this).all();
  }

  /**
   * If you just need to retrieve a single row from the database table, you may use the first() method.
   * This method will return a single Obremap object
   * @returns Obremap object
   */
  static first() {
    this.setModel(this);
    return adapter(this.options.model ?? this).first();
  }

  /**
   * If you just need to retrieve a last row from the database table, you may use the last() method.
   * This method will return a single Obremap object
   * @returns Obremap object
   */
  static last() {
    this.setModel(this);
    return adapter(this.options.model ?? this).last();
  }

  /**
   * Get the count of seleced rows
   * @returns Number
   */
  static count() {
    this.setModel(this);
    return adapter(this.options.model ?? this).count();
  }

  static max(column) {
    this.setModel(this);
    return adapter(this.options.model ?? this).max(column);
  }

  static min(column) {
    this.setModel(this);
    return adapter(this.options.model ?? this).min(column);
  }

  static sum(column) {
    this.setModel(this);
    return adapter(this.options.model ?? this).sum(column);
  }

  static avg(column) {
    this.setModel(this);
    return adapter(this.options.model ?? this).avg(column);
  }

  static average(column) {
    return this.avg(column);
  }

  static get() {
    this.setModel(this);
    return adapter(this.options.model ?? this).get();
  }

  static toSql(values = false, type = "select") {
    this.setModel(this);
    return adapter(this.options.model ?? this).toSql(values, type);
  }

  static insertToSql(values = false) {
    return this.toSql(values, "insert");
  }

  static updateToSql(values = false) {
    return this.toSql(values, "update");
  }

  static deleteToSql(values = false) {
    return this.toSql(values, "delete");
  }

  static truncateToSql(values = false) {
    return this.toSql(values, "truncate");
  }

  static find(id, ...columns) {
    return this.where((this.options.model ?? this).primaryKey, id)
      .select(...columns)
      .first();
  }

  static value(column) {
    this.setModel(this);
    this.select(column);
    return adapter(this.options.model ?? this).value(column);
  }

  static paginate(perPage = 15, page = 1, pageName = "page") {
    let from = (page - 1) * perPage;
    from = from > 0 ? from : 1;
    from = page > 1 ? from + 1 : from;
    let to = page * perPage;
    return this.select(...columns)
      .forPage(page, perPage)
      .get()
      .then((res) => {
        return this.limit(undefined)
          .offset(undefined)
          .count()
          .then((count) => {
            to = to > count ? count : to;
            let lastPage = Math.ceil(count / perPage);
            if (page > lastPage) {
              from = null;
              to = null;
              count = null;
            }
            return {
              currentPage: page,
              data: res,
              from,
              to,
              lastPage,
              perPage,
              total: count,
            };
          });
      });
  }

  static implode(column, glue = "") {
    return this.select(column)
      .get()
      .then((res) => {
        return res.map((e) => e[column]).join(glue);
      });
  }

  static exists() {
    return this.count().then((count) => count > 0);
  }

  static doesntExist() {
    return this.exists().then((res) => !res);
  }

  static update(values) {
    if (values) this.set(values, undefined, true);
    return adapter(this.options.model ?? this).update();
  }

  static insert(values) {
    if (values) this.set(values, undefined, true);
    return adapter(this.options.model ?? this).insert();
  }

  static delete(id, user_id) {
    this.setModel(this);
    if (id) this.where(this.options.model.primaryKey, id);
    if (this.getLogicalDeleted) {
      let set = {
        [this.options.model.deleted]: true,
        [this.options.model.deletedAt]: this.options.model.currentDate,
      };
      if (user_id) set[this.options.model.deletedBy] = user_id;
      return this.set(set).setTimestamps(false).update();
    }
    return adapter(this.options.model ?? this).delete();
  }

  static truncate() {
    return adapter(this.options.model ?? this).truncate();
  }

  // ### QUERYBUILDER ## //
  static table(tableName) {
    this.setModel(this);
    if (!tableName) return this;
    tableName = tableName.replaceAll(/\`/gi, "").split(".").join("`.`");
    this.options.tableName = `\`${tableName}\``;
    return this;
  }

  static setTimestamps(timestamps) {
    this.setModel(this);
    this.options.timestamps = timestamps;
    return this;
  }

  static setCreatedAt(createdAt) {
    this.setModel(this);
    this.options.createdAt = createdAt;
    return this;
  }

  static setUpdatedAt(updatedAt) {
    this.setModel(this);
    this.options.updatedAt = updatedAt;
    return this;
  }

  static select(...select) {
    this.setModel(this);
    this.options.select = select;
    return this;
  }

  static where(
    column,
    operator = "=",
    value,
    separator = ", ",
    parenthesis = true,
    isFunction = false
  ) {
    this.setModel(this);
    let where = this.options.where ? this.options.where : [];
    if (!this.operators.includes(operator)) {
      value = operator;
      operator = "=";
    }

    if (column.constructor.name === "Array") {
      where = [
        ...where,
        column.map((ele) => {
          let [column, operator, value] = ele;
          if (
            typeof column == "object" ||
            typeof operator == "object" ||
            typeof value == "object"
          )
            throw new Error(
              "Each element of the array should be an array containing the three arguments typically passed to the where method. [column, operator, value]"
            );

          if (!this.operators.includes(operator)) {
            value = operator;
            operator = "=";
          }
          return {
            column,
            operator,
            value,
            orWhere: false,
            separator,
            parenthesis,
            isFunction,
          };
        }),
      ];
    }

    if (column.constructor.name == "String") {
      where.push({
        column,
        operator,
        value,
        orWhere: false,
        separator,
        parenthesis,
        isFunction,
      });
    }

    this.options.where = where;
    return this;
  }

  static orWhere(
    column,
    operator = "=",
    value,
    separator = ", ",
    parenthesis = true,
    isFunction = false
  ) {
    this.setModel(this);
    let orWhere = this.options.orWhere ? this.options.orWhere : [];
    if (!this.operators.includes(operator)) {
      value = operator;
      operator = "=";
    }

    if (column.constructor.name === "Array") {
      orWhere = [
        ...orWhere,
        column.map((ele) => {
          let [column, operator, value] = ele;
          if (
            typeof column == "object" ||
            typeof operator == "object" ||
            typeof value == "object"
          )
            throw new Error(
              "Each element of the array should be an array containing the three arguments typically passed to the orWhere method. [column, operator, value]"
            );

          if (!this.operators.includes(operator)) {
            value = operator;
            operator = "=";
          }
          return {
            column,
            operator,
            value,
            orWhere: true,
            separator,
            parenthesis,
            isFunction,
          };
        }),
      ];
    }

    if (column.constructor.name == "String") {
      orWhere.push({
        column,
        operator,
        value,
        orWhere: true,
        separator,
        parenthesis,
        isFunction,
      });
    }

    this.options.where = [...this.options.where, ...orWhere];
    return this;
  }

  static whereIn(column, values) {
    return this.where(column, "in", values);
  }

  static orWhereIn(column, values) {
    return this.orWhere(column, "in", values);
  }

  static whereNotIn(column, values) {
    return this.where(column, "not in", values);
  }

  static orWhereNotIn(column, values) {
    return this.orWhere(column, "not in", values);
  }

  static whereNull(column) {
    return this.where(column, "is null");
  }

  static orWhereNull(column) {
    return this.orWhere(column, "is null");
  }

  static whereNotNull(column) {
    return this.where(column, "is not null");
  }

  static orWhereNotNull(column) {
    return this.orWhere(column, "is not null");
  }

  static whereBetween(column, values) {
    return this.where(column, "between", values, " AND ", false);
  }

  static orWhereBetween(column, values) {
    return this.orWhere(column, "between", values, " AND ", false);
  }

  static whereNotBetween(column, values) {
    return this.where(column, "not between", values, " AND ", false);
  }

  static orWhereNotBetween(column, values) {
    return this.orWhere(column, "not between", values, " AND ", false);
  }

  static whereJsonContains(column, value) {
    return this.where(column, null, value, "", true, "json_contains");
  }

  static orWhereJsonContains(column, value) {
    return this.orWhere(column, null, value, "", true, "json_contains");
  }

  static whereJsonDoesntContains(column, value) {
    return this.where(column, null, value, "", true, "not json_contains");
  }

  static orWhereJsonDoesntContains(column, value) {
    return this.orWhere(column, null, value, "", true, "not json_contains");
  }

  static whereJsonLength(column, operator = null, value) {
    return this.where(column, operator, value, "", true, "json_length");
  }

  static orWhereJsonLength(column, operator = null, value) {
    return this.orWhere(column, operator, value, "", true, "json_length");
  }

  static orderBy(column, direction = "ASC") {
    this.setModel(this);
    if (!this.options.orderBy) this.options.orderBy = [];
    this.options.orderBy = [...this.options.orderBy, [column, direction]];
    return this;
  }

  static latest(column) {
    this.setModel(this);
    return this.orderBy(column ? column : this.options.model.createdAt, "desc");
  }

  static oldest(column) {
    this.setModel(this);
    return this.orderBy(column ?? this.options.model.createdAt, "asc");
  }

  static reorder(column = null, direction = "ASC") {
    if (column !== null) this.orderBy(column, direction);
    this.options.orderBy = undefined;
    return this;
  }

  static groupBy(...columns) {
    this.setModel(this);
    if (!this.options.groupBy) this.options.groupBy = [];
    this.options.groupBy = [...this.options.groupBy, ...columns];
    return this;
  }

  static offset(offset) {
    this.setModel(this);
    this.options.offset = offset;
    return this;
  }

  static skip(value) {
    return this.offset(value);
  }

  static limit(limit) {
    this.setModel(this);
    this.options.limit = limit;
    return this;
  }

  static take(value) {
    return this.limit(value);
  }

  static forPage(page, perPage = 15) {
    return this.offset((page - 1) * perPage).limit(perPage);
  }

  static set(column, value, override = false) {
    this.setModel(this);
    let set = override ? {} : { ...this.options.set };
    if (typeof column === "string") {
      set[column] = value;
    } else if (typeof column === "object" && !Array.isArray(column)) {
      set = { ...set, ...column };
    } else if (typeof column === "object" && Array.isArray(column)) {
      set = column;
    }

    this.options.set = set;
    return this;
  }

  static logicalDeleted(logicalDelete = true) {
    this.setModel(this);
    this.options.logicalDelete = logicalDelete;
    return this;
  }

  static join(
    table,
    first,
    operator = null,
    second = null,
    type = "inner",
    where = false
  ) {
    this.setModel(this);
    if (!this.options.joins) this.options.joins = [];
    let joins = [...this.options.joins];

    if (!["inner", "left", "right", "cross"].includes(type)) {
      where = type;
    }

    if (["inner", "left", "right", "cross"].includes(second)) {
      type = second;
    }

    if (!this.operators.includes(operator)) {
      second = operator;
      operator = "=";
    }

    joins.push({ table, first, operator, second, type, where });
    this.options.joins = joins;
    return this;
  }

  static leftJoin(table, first, operator = null, second = null) {
    return this.join(table, first, operator, second, "left");
  }

  static rightJoin(table, first, operator = null, second = null) {
    return this.join(table, first, operator, second, "right");
  }

  static crossJoin(table, first, operator = null, second = null) {
    return this.join(table, first, operator, second, "cross");
  }

  static queryBuilder() {
    return true;
  }

  static setModel(model) {
    if (!model.builder) {
      this.init();
      this.builder = true;
    }
  }

  static init() {
    this.options = {};
    QueryBuilder.options = {};
    delete this.builder;
  }

  static get getTableName() {
    let tableName =
      this.options.tableName ??
      this.tableName ??
      getTableName(this.name, this.snakeCase);
    tableName = tableName.replaceAll(/\`/gi, "").split(".").join("`.`");
    return `\`${tableName}\``;
  }

  static get getTimestamps() {
    return this.options.timestamps ?? this.timestamps;
  }

  static get getCreatedAt() {
    return this.options.createdAt ?? this.createdAt;
  }

  static get getUpdatedAt() {
    return this.options.updatedAt ?? this.updatedAt;
  }

  static get getLogicalDeleted() {
    return this.options.logicalDelete ?? this.logicalDelete;
  }
}
