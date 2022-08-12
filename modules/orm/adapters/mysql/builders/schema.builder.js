import adapter from "../index";

export default class SchemaBuilder {
  static _engine = "InnoDB";
  static _charset = "utf8mb4";
  static _collation = "utf8mb4_unicode_ci";

  static options = {};
  fields = [];
  alterTables = [];
  FIELD_INDEX = 0;
  #OTHER_FIELD_INDEX = 0;

  static id() {
    this.increments("id");
    this.options.fields[this.options.FIELD_INDEX].type = "bigint";
    return SchemaBuilder;
  }

  static foreignId(name) {
    this.createField({
      name,
      type: "bigint",
      unsigned: true,
    });
    return SchemaBuilder;
  }

  static bigIncrements(name) {
    this.increments(name);
    this.options.fields[this.options.FIELD_INDEX].type = "bigint";
    return SchemaBuilder;
  }

  static bigInteger(name) {
    this.createField({
      name,
      type: "bigint",
    });
    return SchemaBuilder;
  }

  static binary(name) {
    this.createField({
      name,
      type: "blob",
    });
    return SchemaBuilder;
  }

  static boolean(name) {
    this.createField({
      name,
      type: "tinyint",
      length: 1,
    });
    return SchemaBuilder;
  }

  static char(name, length = 255) {
    this.createField({
      name,
      type: "char",
      length,
    });
    return SchemaBuilder;
  }

  static date(name) {
    this.createField({
      name,
      type: "date",
      nullable: false,
    });
    return SchemaBuilder;
  }

  static dateTime(name, length = 0) {
    this.date(name);
    this.options.fields[this.options.FIELD_INDEX].length = length;
    this.options.fields[this.options.FIELD_INDEX].type = "datetime";
    return SchemaBuilder;
  }

  static dateTimeTz(name, length = 0) {
    return this.dateTime(name, length);
  }

  static decimal(name, digits = 8, decimal = 2) {
    this.createField({
      name,
      type: "decimal",
      digits,
      decimal,
    });
    return SchemaBuilder;
  }

  static double(name, digits = 8, decimal = 2) {
    this.decimal(name, digits, decimal);
    this.options.fields[this.options.FIELD_INDEX].type = "double";
    return SchemaBuilder;
  }

  /**
   * @param {string} name Column name
   * @param {array} values Enum values
   */
  static enum(name, values) {
    if (!values) throw Error("Values is required. Ex. ['easy', 'hard']");
    if (values.constructor !== Array)
      throw Error("Values must be an array Ex. ['easy', 'hard']");

    this.createField({
      name,
      type: "enum",
      values,
    });
    return SchemaBuilder;
  }

  static float(name, digits = 8, decimal = 2) {
    return this.decimal(name, digits, decimal);
  }

  static geometry(name) {
    this.createField({
      name,
      type: "geometry",
      nullable: false,
    });
    return SchemaBuilder;
  }

  static geometryCollection(name) {
    this.geometry(name);
    this.options.fields[this.options.FIELD_INDEX].type = "geometrycollection";
    return SchemaBuilder;
  }

  static increments(name) {
    this.createField({
      name,
      type: "int",
      unsigned: true,
      auto_increment: true,
      primary: true,
    });
    return SchemaBuilder;
  }

  static integer(name, length = 11) {
    this.createField({
      name,
      type: "int",
      length,
    });
    return SchemaBuilder;
  }

  static ipAddress(name) {
    return this.string(name);
  }

  static json(name) {
    this.createField({
      name,
      type: "json",
    });
    return SchemaBuilder;
  }

  static jsonb(name) {
    return this.json(name);
  }

  static lineString(name) {
    this.createField({
      name,
      type: "linestring",
    });
    return SchemaBuilder;
  }

  static longText(name) {
    this.createField({
      name,
      type: "longtext",
    });
    return SchemaBuilder;
  }

  static macAddress(name) {
    return this.string(name, 17);
  }

  static mediumIncrements(name) {
    this.increments(name);
    this.options.fields[this.options.FIELD_INDEX].type = "mediumint";
    return SchemaBuilder;
  }

  static mediumInteger(name) {
    this.createField({
      name,
      type: "mediumint",
    });
    return SchemaBuilder;
  }

  static mediumText(name) {
    this.createField({
      name,
      type: "mediumtext",
    });
    return SchemaBuilder;
  }

  static morphs(name, nullable = false) {
    let id = `${name}_id`;
    let type = `${name}_type`;
    this.foreignId(id).nullable(nullable);
    this.string(type, 255).nullable(nullable);
    this.options.alterTables.push({
      name: `${this.getTableName}_${id}_${type}_index`,
      type,
      id,
    });
    return SchemaBuilder;
  }

  static uuidMorphs(name, nullable = false) {
    let id = `${name}_id`;
    let type = `${name}_type`;
    this.char(id, 36).nullable(nullable);
    this.string(type, 255).nullable(nullable);
    this.options.alterTables.push({
      name: `${this.getTableName}_${id}_${type}_index`,
      type,
      id,
    });
    return SchemaBuilder;
  }

  static multiLineString(name) {
    this.createField({
      name,
      type: "multilinestring",
    });
    return SchemaBuilder;
  }

  static multiPoint(name) {
    this.createField({
      name,
      type: "multipoint",
    });
    return SchemaBuilder;
  }

  static multiPolygon(name) {
    this.createField({
      name,
      type: "multipolygon",
    });
    return SchemaBuilder;
  }

  static nullableMorphs(name) {
    return this.morphs(name, true);
  }

  static nullableUuidMorphs(name) {
    return this.uuidMorphs(name, true);
  }

  static nullableTimestamps(length = 0) {
    return this.timestamps(length, true);
  }

  static timestamps(length = 0, nullable = false) {
    this.timestamp("created_at", length).nullable(nullable);
    this.timestamp("updated_at", length).nullable(true);
    return SchemaBuilder;
  }

  static point(name) {
    this.createField({
      name,
      type: "point",
    });
    return SchemaBuilder;
  }

  static polygon(name) {
    this.createField({
      name,
      type: "polygon",
    });
    return SchemaBuilder;
  }

  static rememberToken() {
    return this.string("remember_token", 100).nullable();
  }

  static set(name, values) {
    if (!values) throw Error("Values is required. Ex. ['easy', 'hard']");
    if (values.constructor !== Array)
      throw Error("Values must be an array Ex. ['easy', 'hard']");

    this.createField({
      name,
      type: "set",
      values,
    });
    return SchemaBuilder;
  }

  static smallIncrements(name) {
    this.increments(name);
    this.options.fields[this.options.FIELD_INDEX].type = "smallint";
    return SchemaBuilder;
  }

  static smallInteger(name) {
    this.createField({
      name,
      type: "smallint",
    });
    return SchemaBuilder;
  }

  static softDeletes(name, length = 0) {
    return this.timestamp(name, length);
  }

  static softDeletesTz(name, length = 0) {
    return this.timestamp(name, length);
  }

  static string(name, length = 45) {
    this.createField({
      name,
      type: "varchar",
      length,
    });
    return SchemaBuilder;
  }

  static text(name) {
    this.createField({
      name,
      type: "text",
    });
    return SchemaBuilder;
  }

  static timestampTz(name, length = 0) {
    return this.timestamp(name, length);
  }

  static tinyIncrements(name) {
    this.increments(name);
    this.options.fields[this.options.FIELD_INDEX].type = "tinyint";
    return SchemaBuilder;
  }

  static tinyInteger(name) {
    this.createField({
      name,
      type: "tinyint",
    });
    return SchemaBuilder;
  }

  static timestamp(name, length = 0) {
    this.createField({
      name,
      type: "timestamp",
      length,
    });
    return SchemaBuilder;
  }

  static unsignedBigInteger(name) {
    return this.bigIncrements(name).unsigned();
  }

  static unsignedDecimal(name, digits = 8, decimal = 2) {
    return this.decimal(name, digits, decimal).unsigned();
  }

  static unsignedInteger(name, length = 11) {
    return this.integer(name, length).unsigned();
  }

  static unsignedMediumInteger(name) {
    return this.mediumInteger(name).unsigned();
  }

  static unsignedSmallInteger(name) {
    return this.smallInteger(name).unsigned();
  }

  static unsignedTinyInteger(name) {
    return this.tinyInteger(name).unsigned();
  }

  static uuid(name) {
    return this.char(name, 36);
  }

  static year(name) {
    this.createField({
      name,
      type: "year",
    });
    return SchemaBuilder;
  }

  /**
   * Change the column position on table after or before exisiting column
   * @param {string} type Set the type of column use the schema builder method name
   * @param {string} column Set the name of column to move
   * @param {string} existingColumn Set the name of reference column
   * @param {string} moveType Set the move type. Options [after, first]. Default: after
   * @param  {...any} options Set the custom options from schema builder method
   * @returns SchemaBuilder
   */
  static moveColumn(type, column, existingColumn, ...options) {
    this[type](column, ...options)
      .after(existingColumn)
      .change();
    return SchemaBuilder;
  }

  static renameColumn(type, currentName, name, ...options) {
    this[type](currentName, ...options)
      .rename(name)
      .change();
    return SchemaBuilder;
  }

  // MODIFIERS
  static rename(name) {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].rename = name;
    return SchemaBuilder;
  }

  static after(column) {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].after = column;
    return SchemaBuilder;
  }

  static autoIncrement() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].auto_increment = true;
    return SchemaBuilder;
  }

  static charset(charset) {
    this.setModel(this);
    this.options.charset = charset;
    return SchemaBuilder;
  }

  static engine(engine) {
    this.setModel(this);
    this.options.engine = engine;
    return SchemaBuilder;
  }

  static collation(collation) {
    this.setModel(this);
    this.options.collation = collation;
    return SchemaBuilder;
  }

  static comment(comment) {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].comment = comment;
    return SchemaBuilder;
  }

  static constrained(table) {
    this.setModel(this);
    let field = this.options.fields[this.options.FIELD_INDEX].name;
    this.options.alterTables.push({
      name: `${this.getTableName}_${field}_foreign`,
      type,
      id,
    });
  }

  static default(value) {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].default = value;
    return SchemaBuilder;
  }

  static first() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].first = true;
    return SchemaBuilder;
  }

  static nullable(nullable = true) {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].nullable = nullable;
    return SchemaBuilder;
  }

  static unsigned() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].unsigned = true;
    return SchemaBuilder;
  }

  static unique() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].unique = true;
    return SchemaBuilder;
  }

  static useCurrent() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].default = "CURRENT_TIMESTAMP";
    return SchemaBuilder;
  }

  static primaryKey() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].primary = true;
    return SchemaBuilder;
  }

  // GENERAL UTILS
  static createField(options) {
    if (!options.name) throw Error("Column Name is required.");
    this.checkName(options.name);
    this.options.FIELD_INDEX = this.options.fields
      ? this.options.fields.length
      : 0;
    if (!this.options.fields) this.options.fields = [];
    this.options.fields[this.options.FIELD_INDEX] = {
      nullable: false,
      ...options,
    };
    return SchemaBuilder;
  }

  static checkName(name) {
    this.setModel(this);
    if (!this.options.fields || this.options.fields.length === 0) return true;
    this.options.fields.filter((obj) => {
      if (obj.name == name)
        throw Error(`This field name ("${name}") already exists`);
    });
  }

  static dropColumn(column) {
    this.setModel(this);
    this.options.column = column;
    this.options.drop = true;
    return SchemaBuilder;
  }

  static change() {
    this.setModel(this);
    this.options.fields[this.options.FIELD_INDEX].modify = true;
    return SchemaBuilder;
  }

  static setModel(model) {
    if (!model.builder) {
      this.init();
      this.builder = true;
    }
  }

  static init() {
    this.options = {};
    SchemaBuilder.options = {};
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

  static get getCharset() {
    return this.options.charset ?? this._charset;
  }

  static get getCollation() {
    return this.options.collation ?? this._collation;
  }

  static get getEngine() {
    return this.options.engine ?? this._engine;
  }
}
