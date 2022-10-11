import adapter from "orm/adapters";
import { getTableName } from "global/get-name";
import _ from "lodash";
import url from "url";

export default class QueryBuilder {
  options = {};
  operators = [
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

  constructor(model) {
    this.setModel(model);
    this.adapter = adapter(this);
  }

  /**
   * Execute a SQL query. In order to avoid SQL Injection attacks, you should always escape any user provided data before using it inside a SQL query.
   * @param {string} sql - SQL query, use "?" instead of values to use escaping method.
   * @param {array} values - These values will be used to be replaced in the escaping method.
   * @returns
   */
  sql(sql, values = []) {
    return this.adapter.sql({ sql, values, direct: true });
  }

  /**
   * The Obremap all() method will return all of the results in the model's table. Since each Obremap model serves as a query builder,
   * you may also add constraints to queries, and then use the get method to retrieve the results.
   * @returns Obremap Collection
   */
  all() {
    return this.adapter.all();
  }

  /**
   * If you just need to retrieve a single row from the database table, you may use the first() method.
   * This method will return a single Obremap object
   * @returns Obremap object
   */
  first() {
    return this.adapter.first();
  }

  /**
   * If you just need to retrieve a last row from the database table, you may use the last() method.
   * This method will return a single Obremap object
   * @returns Obremap object
   */
  last() {
    return this.adapter.last();
  }

  /**
   * Get the count of seleced rows
   * @returns Number
   */
  count() {
    return this.adapter.count();
  }

  max(column) {
    return this.adapter.max(column);
  }

  min(column) {
    return this.adapter.min(column);
  }

  sum(column) {
    return this.adapter.sum(column);
  }

  avg(column) {
    return this.adapter.avg(column);
  }

  average(column) {
    return this.avg(column);
  }

  get() {
    return this.adapter.get();
  }

  toSql(values = false, type = "select") {
    return this.adapter.toSql(values, type);
  }

  insertToSql(values = false) {
    return this.toSql(values, "insert");
  }

  updateToSql(values = false) {
    return this.toSql(values, "update");
  }

  deleteToSql(values = false) {
    return this.toSql(values, "delete");
  }

  truncateToSql(values = false) {
    return this.toSql(values, "truncate");
  }

  find(id, ...columns) {
    return this.where((this.options.model ?? this).primaryKey, id)
      .select(...columns)
      .first();
  }

  value(column) {
    this.select(column);
    return this.adapter.value(column);
  }

  paginate(perPage = 15, page = 1, pageName = "page") {
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

  implode(column, glue = "") {
    return this.select(column)
      .get()
      .then((res) => {
        return res.map((e) => e[column]).join(glue);
      });
  }

  exists() {
    return this.count().then((count) => count > 0);
  }

  doesntExist() {
    return this.exists().then((res) => !res);
  }

  update(values) {
    if (values) this.set(values, undefined, true);
    return this.adapter.update();
  }

  insert(values) {
    if (values) this.set(values, undefined, true);
    return this.adapter.insert();
  }

  delete(id, user_id) {
    if (id) this.where(this.options.model.primaryKey, id);
    if (this.getLogicalDeleted) {
      let set = {
        [this.options.model.deleted]: true,
        [this.options.model.deletedAt]: this.options.model.currentDate,
      };
      if (user_id) set[this.options.model.deletedBy] = user_id;
      return this.set(set).setTimestamps(false).update();
    }
    return this.adapter.delete();
  }

  truncate() {
    return this.adapter.truncate();
  }

  // ### QUERYBUILDER ## //
  table(tableName) {
    if (!tableName) return this;
    tableName = tableName.replaceAll(/\`/gi, "").split(".").join("`.`");
    this.options.tableName = `\`${tableName}\``;
    return this;
  }

  setTimestamps(timestamps) {
    this.options.timestamps = timestamps;
    return this;
  }

  setCreatedAt(createdAt) {
    this.options.createdAt = createdAt;
    return this;
  }

  setUpdatedAt(updatedAt) {
    this.options.updatedAt = updatedAt;
    return this;
  }

  select(...select) {
    this.options.select = select;
    return this;
  }

  where(
    column,
    operator = "=",
    value,
    separator = ", ",
    parenthesis = true,
    isFunction = false
  ) {
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

  orWhere(
    column,
    operator = "=",
    value,
    separator = ", ",
    parenthesis = true,
    isFunction = false
  ) {
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

  whereIn(column, values) {
    return this.where(column, "in", values);
  }

  orWhereIn(column, values) {
    return this.orWhere(column, "in", values);
  }

  whereNotIn(column, values) {
    return this.where(column, "not in", values);
  }

  orWhereNotIn(column, values) {
    return this.orWhere(column, "not in", values);
  }

  whereNull(column) {
    return this.where(column, "is null");
  }

  orWhereNull(column) {
    return this.orWhere(column, "is null");
  }

  whereNotNull(column) {
    return this.where(column, "is not null");
  }

  orWhereNotNull(column) {
    return this.orWhere(column, "is not null");
  }

  whereBetween(column, values) {
    return this.where(column, "between", values, " AND ", false);
  }

  orWhereBetween(column, values) {
    return this.orWhere(column, "between", values, " AND ", false);
  }

  whereNotBetween(column, values) {
    return this.where(column, "not between", values, " AND ", false);
  }

  orWhereNotBetween(column, values) {
    return this.orWhere(column, "not between", values, " AND ", false);
  }

  whereJsonContains(column, value) {
    return this.where(column, null, value, "", true, "json_contains");
  }

  orWhereJsonContains(column, value) {
    return this.orWhere(column, null, value, "", true, "json_contains");
  }

  whereJsonDoesntContains(column, value) {
    return this.where(column, null, value, "", true, "not json_contains");
  }

  orWhereJsonDoesntContains(column, value) {
    return this.orWhere(column, null, value, "", true, "not json_contains");
  }

  whereJsonLength(column, operator = null, value) {
    return this.where(column, operator, value, "", true, "json_length");
  }

  orWhereJsonLength(column, operator = null, value) {
    return this.orWhere(column, operator, value, "", true, "json_length");
  }

  orderBy(column, direction = "ASC") {
    if (!this.options.orderBy) this.options.orderBy = [];
    this.options.orderBy = [...this.options.orderBy, [column, direction]];
    return this;
  }

  latest(column) {
    return this.orderBy(column ? column : this.options.model.createdAt, "desc");
  }

  oldest(column) {
    return this.orderBy(column ?? this.options.model.createdAt, "asc");
  }

  reorder(column = null, direction = "ASC") {
    if (column !== null) this.orderBy(column, direction);
    this.options.orderBy = undefined;
    return this;
  }

  groupBy(...columns) {
    if (!this.options.groupBy) this.options.groupBy = [];
    this.options.groupBy = [...this.options.groupBy, ...columns];
    return this;
  }

  offset(offset) {
    this.options.offset = offset;
    return this;
  }

  skip(value) {
    return this.offset(value);
  }

  limit(limit) {
    this.options.limit = limit;
    return this;
  }

  take(value) {
    return this.limit(value);
  }

  forPage(page, perPage = 15) {
    return this.offset((page - 1) * perPage).limit(perPage);
  }

  set(column, value, override = false) {
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

  logicalDeleted(logicalDelete = true) {
    this.options.logicalDelete = logicalDelete;
    return this;
  }

  join(
    table,
    first,
    operator = null,
    second = null,
    type = "inner",
    where = false
  ) {
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

  leftJoin(table, first, operator = null, second = null) {
    return this.join(table, first, operator, second, "left");
  }

  rightJoin(table, first, operator = null, second = null) {
    return this.join(table, first, operator, second, "right");
  }

  crossJoin(table, first, operator = null, second = null) {
    return this.join(table, first, operator, second, "cross");
  }

  queryBuilder() {
    return true;
  }

  setModel(model) {
    if (!model.builder) {
      this.model = model;
      this.init();
      this.builder = true;
    }
  }

  init() {
    this.options = {};
    QueryBuilder.options = {};
    delete this.builder;
  }

  get getTableName() {
    let tableName =
      this.options.tableName ??
      this.model.tableName ??
      getTableName(this.model.name, this.model.snakeCase);
    tableName = tableName.replaceAll(/\`/gi, "").split(".").join("`.`");
    return `\`${tableName}\``;
  }

  get getTimestamps() {
    return this.options.timestamps ?? this.model.timestamps;
  }

  get getCreatedAt() {
    return this.options.createdAt ?? this.model.createdAt;
  }

  get getUpdatedAt() {
    return this.options.updatedAt ?? this.model.updatedAt;
  }

  get getLogicalDeleted() {
    return this.options.logicalDelete ?? this.model.logicalDelete;
  }
}
