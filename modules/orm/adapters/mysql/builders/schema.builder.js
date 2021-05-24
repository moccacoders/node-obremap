import adapter from '../index'

export default class SchemaBuilder {
	engine = 'InnoDB';
	charset = 'utf8mb4';
	collation = 'utf8mb4_unicode_ci';

	fields = [];
	alterTables = [];
	#FIELD_INDEX = 0;
	#OTHER_FIELD_INDEX = 0;

	constructor(options) {
		this.model = options.model
		delete options.model;
		this.options = options
	}

	id(){
		this.increments('id');
		this.fields[this.#FIELD_INDEX].type = "bigint";
		return this;
	}

	foreignId(name){
		this.createField({
			name,
			type: "bigint",
			unsigned: true
		});
		return this;
	}

	bigIncrements(name){
		this.increments(name);
		this.fields[this.#FIELD_INDEX].type = "bigint";
		return this;
	}

	bigInteger(name){
		this.createField({
			name,
			type: "bigint",
		});
		return this;
	}

	binary(name){
		this.createField({
			name,
			type: "blob",
		});
		return this;
	}

	boolean(name){
		this.createField({
			name,
			type: "tinyint",
			length: 1
		});
		return this;
	}

	char(name, length=255){
		this.createField({
			name,
			type: "char",
			length
		});
		return this;
	}

	date(name){
		this.createField({
			name,
			type: "date",
			nullable: false
		});
		return this;
	}

	dateTime(name, length = 0){
		this.date(name)
		this.fields[this.#FIELD_INDEX].length = length;
		this.fields[this.#FIELD_INDEX].type = "datetime";
		return this;
	}

	dateTimeTz(name, length = 0){
		return this.dateTime(name, length)
	}

	decimal(name, digits = 8, decimal = 2){
		this.createField({
			name,
			type: "decimal",
			digits,
			decimal
		});
		return this;
	}

	double(name, digits = 8, decimal = 2){
		this.decimal(name, digits, decimal)
		this.fields[this.#FIELD_INDEX].type = "double";
		return this;
	}

	/**
	* @param {string} name Column name
	* @param {array} values Enum values	
	*/
	enum(name, values){
		if(!values) throw Error("Values is required. Ex. ['easy', 'hard']");
		if(values.constructor !== Array) throw Error("Values must be an array Ex. ['easy', 'hard']");

		this.createField({
			name,
			type: "enum",
			values
		});
		return this;
	}

	float(name, digits = 8, decimal = 2){
		return this.decimal(name, digits, decimal)
	}

	geometry(name){
		this.createField({
			name,
			type: "geometry",
			nullable: false
		});
		return this;
	}

	geometryCollection(name){
		this.geometry(name);
		this.fields[this.#FIELD_INDEX].type = "geometrycollection";
		return this;
	}

	increments(name){
		this.createField({
			name,
			type: "int",
			unsigned: true,
			auto_increment : true,
			primary: true
		});
		return this;
	}

	integer(name, length=11){
		this.createField({
			name,
			type: "int",
			length
		});
		return this;
	}

	ipAddress(name){
		return this.string(name);
	}

	json(name){
		this.createField({
			name,
			type : "json"
		});
		return this;
	}

	jsonb(name){
		return this.json(name);
	}

	lineString(name){
		this.createField({
			name,
			type: "linestring"
		})
		return this;
	}

	longText(name){
		this.createField({
			name,
			type : "longtext"
		})
		return this;
	}

	macAddress(name){
		return this.string(name, 17)
	}

	mediumIncrements(name){
		this.increments(name);
		this.fields[this.#FIELD_INDEX].type = "mediumint";
		return this;
	}

	mediumInteger(name){
		this.createField({
			name,
			type : "mediumint"
		})
		return this;
	}

	mediumText(name){
		this.createField({
			name,
			type : "mediumtext"
		})
		return this;
	}

	morphs(name, nullable = false){
		let id = `${name}_id`;
		let type = `${name}_type`;
		this.foreignId(id).nullable(nullable);
		this.string(type, 255).nullable(nullable);
		this.alterTables.push({
			name : `${this.model.tableName}_${id}_${type}_index`,
			type,
			id
		});
		return this;
	}

	uuidMorphs(name, nullable = false){
		let id = `${name}_id`;
		let type = `${name}_type`;
		this.char(id, 36).nullable(nullable);
		this.string(type, 255).nullable(nullable);
		this.alterTables.push({
			name : `${this.model.tableName}_${id}_${type}_index`,
			type,
			id
		});
		return this;
	}

	multiLineString(name){
		this.createField({
			name,
			type : "multilinestring"
		})
		return this;
	}

	multiPoint(name){
		this.createField({
			name,
			type : "multipoint"
		})
		return this;
	}

	multiPolygon(name){
		this.createField({
			name,
			type : "multipolygon"
		})
		return this;
	}

	nullableMorphs(name){
		return this.morphs(name, true);
	}

	nullableUuidMorphs(name){
		return this.uuidMorphs(name, true);
	}

	nullableTimestamps(length=0){
		return this.timestamps(length, true);
	}

	timestamps(length=0, nullable=false){
		this.timestamp('created_at', length).nullable(nullable);
		this.timestamp('updated_at', length).nullable(nullable);
		return this;
	}

	point(name){
		this.createField({
			name,
			type : "point"
		})
		return this;
	}

	polygon(name){
		this.createField({
			name,
			type : "polygon"
		})
		return this;
	}

	rememberToken(){
		return this.string('remember_token', 100).nullable();
	}

	set(name, values){
		if(!values) throw Error("Values is required. Ex. ['easy', 'hard']");
		if(values.constructor !== Array) throw Error("Values must be an array Ex. ['easy', 'hard']");

		this.createField({
			name,
			type: "set",
			values
		});
		return this;
	}

	smallIncrements(name){
		this.increments(name);
		this.fields[this.#FIELD_INDEX].type = "smallint";
		return this;
	}

	smallInteger(name){
		this.createField({
			name,
			type : "smallint"
		})
		return this;
	}

	softDeletes(name, length = 0){
		return this.timestamp(name, length)
	}

	softDeletesTz(name, length = 0){
		return this.timestamp(name, length)
	}

	string(name, length=45){
		this.createField({
			name,
			type: "varchar",
			length
		});
		return this;
	}

	text(name){
		this.createField({
			name,
			type : "text"
		})
		return this;
	}

	timestampTz(name, length = 0){
		return this.timestamp(name, length)
	}

	tinyIncrements(name){
		this.increments(name);
		this.fields[this.#FIELD_INDEX].type = "tinyint";
		return this;
	}

	tinyInteger(name){
		this.createField({
			name,
			type : "tinyint"
		})
		return this;
	}

	timestamp(name, length = 0){
		this.createField({
			name,
			type: "timestamp",
			length
		});
		return this;
	}

	unsignedBigInteger(name){
		return this.bigIncrements(name).unsigned()
	}

	unsignedDecimal(name, digits = 8, decimal = 2){
		return this.decimal(name, digits, decimal).unsigned()
	}

	unsignedInteger(name, length = 11){
		return this.integer(name, length).unsigned()
	}

	unsignedMediumInteger(name){
		return this.mediumInteger(name).unsigned()
	}

	unsignedSmallInteger(name){
		return this.smallInteger(name).unsigned();
	}

	unsignedTinyInteger(name){
		return this.tinyInteger(name).unsigned()
	}

	uuid(name){
		return this.char(name, 36)
	}

	year(name){
		this.createField({
			name,
			type: "year"
		})
		return this;
	}

	// MODIFIERS
	after(column){
		this.fields[this.#FIELD_INDEX].after = column;
		return this;
	}

	autoIncrement(){
		this.fields[this.#FIELD_INDEX].auto_increment = true;
		return this;
	}

	charset(charset){
		this.fields[this.#FIELD_INDEX].charset = charset;
		return this;
	}

	collation(collation){
		this.fields[this.#FIELD_INDEX].collation = collation;
		return this;
	}

	comment(comment){
		this.fields[this.#FIELD_INDEX].comment = comment;
		return this;
	}

	constrained(table){
		let field = this.fields[this.#FIELD_INDEX].name;
		this.alterTables.push({
			name : `${this.model.tableName}_${field}_foreign`,
			type,
			id
		});
	}

	default(value){
		this.fields[this.#FIELD_INDEX].default = value;
		return this;
	}

	first(){
		this.fields[this.#FIELD_INDEX].first = true;
		return this;
	}

	nullable(nullable = true){
		this.fields[this.#FIELD_INDEX].nullable = nullable;
		return this;
	}

	unsigned(){
		this.fields[this.#FIELD_INDEX].unsigned = true;
		return this;
	}

	unique(){
		this.fields[this.#FIELD_INDEX].unique = true;
		return this;
	}

	useCurrent(){
		this.fields[this.#FIELD_INDEX].default = "CURRENT_TIMESTAMP";
		return this;
	}

	primaryKey(){
		this.fields[this.#FIELD_INDEX].primary = true;
		return this;
	}

	// GENERAL UTILS
	createField(options){
		if(!options.name) throw Error("Column Name is required.");
		this.checkName(options.name)
		this.#FIELD_INDEX = this.fields.length;
		this.fields[this.#FIELD_INDEX] = {
			nullable: false,
			...options
		};
		return this;
	}

	checkName(name){
		this.fields.filter(obj => {
			if(obj.name == name)
				throw Error(`This field name ("${name}") already exists`);
		})
	}

	dropColumn(column){
		this.column = column;
		this.drop = true;
		return this;
	}

	change(){
		this.fields[this.#FIELD_INDEX].modify = true;
		return this;
	}
}
