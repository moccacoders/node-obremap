import moment from 'moment-timezone';
import adapter from './adapters'
import { getTableName, getFieldName } from '../global/get-name'

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
	static timezone = undefined;

	// DB CONNECTION
	static connection = "default";

	// Logical Delete
	static logicalDelete = false;
	static deleted = "deleted";
	static deleted_at = "deleted_at";
	static deleted_by = "deleted_by";

	constructor(values) {
		this.values = values;
	}

	/*
	  database table name,
	  can be overwritten in the user's model
	*/

	static sql (sql, values = []) {
		return adapter(this).sql({sql, values});
	}

	static sqlSync (sql, values = []) {
		return adapter(this).sql({sql, values, sync : true});
	}

	static get getTableName() {
		if(!this.tableName) this.tableName = getTableName(this.name, this.snakeCase);
		return this.tableName;
	}

	static get getTimezone() {
		return this.timezone || global.TZ || process.env.TZ || "America/Los_Angeles"
	}

	static get currentDate (){
		var date = moment().tz(this.getTimezone).format(this.dateFormat != "TIMESTAMP" ? this.dateFormat : "YYYY-MM-DD HH:mm:ss");
		return date;
	}

	static getDateFormat () {
		return this.dateFormat != "TIMESTAMP" ? this.dateFormat : "YYYY-MM-DD HH:mm:ss";
	}

	/*
	  retrieve all results in a table
	  ex Model.all()
	*/
	static all() {
		return adapter(this).select({
			model: this
		})
	}

	static allSync() {
		return adapter(this).select({
			sync: true,
			model: this
		})
	}

	static count() {
		return adapter(this).select({
			select: `COUNT(*) as count`,
			model: this
		})
	}

	static countSync() {
		return adapter(this).select({
			sync : true,
			select: `COUNT(*) as count`,
			model: this
		})
	}

	/*
	  grab the item with matching primary key
	  ex Model.find(id)
	*/
	static find(id) {
		let test = adapter(this).select({
			limit: 1,
			where: {id},
			model: this
		})
		return test;
	}

	/*
	  grab the first item in a table
	  ex Model.first()
	*/
	static first() {
		return adapter(this).select({
			limit: 1,
			first: true,
			model: this
		})
	}

	static firstSync() {
		return adapter(this).select({
			sync: true,
			limit: 1,
			first: true,
			model: this
		})
	}

	/*
	  insert a row in the database
	  ex Model.create({ name: 'bob' })
	*/
	static create(data) {
		return adapter(this).create({
			data,
			model: this
		})
	}

	static createSync(data) {
		return adapter(this).createSync({
			data,
			model: this
		})
	}


	/*
	  update a row in the database
	  ex Model.update({ name: 'raymundo' })
	*/
	static update(data, where) {
		let id = null;
		if (typeof where == "number"){
			id = where;
			where = null;
		}
		return adapter(this).update({
			data,
			id,
			where,
			model: this
		})
	}

	static updateSync(data, where) {
		let id = null;
		if (typeof where == "number"){
			id = where;
			where = null;
		}
		return adapter(this).updateSync({
			data,
			id,
			where,
			model: this
		})
	}

	/*
	  delete a row in the database
	  ex Model.delete({ id: 1 })
	*/
	static delete(where, deleted_by = null) {
		let id = null;
		let data = null;
		if (typeof where == "number"){
			id = where;
			where = null;
		}
		if(this.logicalDelete === true || deleted_by){
			data = {
				[this.deleted] : 1,
				[this.deleted_at] : this.currentDate,
				[this.deleted_by] : deleted_by || null
			}
		}

		return adapter(this)[(this.logicalDelete === true || deleted_by) && deleted_by !== false ? "update" : "delete"]({
			id,
			where,
			data,
			model: this
		})
	}

	static deleteSync(where, deleted_by = null) {
		let id = null;
		let data = null;
		if (typeof where == "number"){
			id = where;
			where = null;
		}
		if(this.logicalDelete === true || deleted_by){
			data = {
				[this.deleted] : 1,
				[this.deleted_at] : this.currentDate,
				[this.deleted_by] : deleted_by || null
			}
		}

		return adapter(this)[(this.logicalDelete === true || deleted_by) && deleted_by !== false ? "updateSync" : "deleteSync"]({
			id,
			where,
			data,
			model: this
		})
	}


	//Query builder methods return a builder instance that is chainable

	/*
	  select certain columns from a table
	  ex Model.select('id', 'name').first()
	*/
	static select(...select) {
		return adapter(this).queryBuilder({
			select,
			model: this
		})
	}

	static truncate() {
		return adapter(this).truncateTable({
			model: this
		})
	}

	static truncateSync() {
		return adapter(this).truncateTable({
			options: {
				sync: true,
			},
			model: this
		})
	}

	/*
	  select certain columns from a table
	  ex Model.orderBy({id : 'desc'}).first()
	*/
	static orderBy(orderBy) {
		return adapter(this).queryBuilder({
			orderBy,
			model: this
		})
	}


	/*
	  contrain a query with a where clause
	  ex Model.where({ id: 1, user_id: 2 }).first()
	*/
	static where(where) {
		if(typeof where == "object")
			Object.entries(where).map(obj => {
				let [key, val] = obj;
				if(/\./.test(key)) return true;
				delete where[key];
				where[`${this.getTableName}.${key}`] = val;
			})
		this.values = where;
		return adapter(this).queryBuilder({
			where,
			model: this
		})
	}

	static orWhere (orWhere) {
		if(typeof orWhere == "object")
		Object.entries(orWhere).map(obj => {
			let [key, val] = obj;
			if(/\./.test(key)) return true;
			delete orWhere[key];
			orWhere[`${this.getTableName}.${key}`] = val;
		})
		return adapter(this).queryBuilder({
			orWhere,
			model: this
		})
	}

	/*
	  contrain amount returned
	  ex Model.limit(5).get()
	*/
	static limit(limit) {
		return adapter(this).queryBuilder({
			limit,
			model: this
		})
	}

	static offset(offset) {
		return adapter(this).queryBuilder({
			offset,
			model: this
		})
	}

	static join(includeTable, localField, operator, remoteField, type = "INNER"){
		if(!["=", "<", ">", "!=", "<>", "<=", ">=", "<=>"].includes(operator)){
			if(remoteField) type = remoteField;
			remoteField = operator;
			operator = "=";
		}

		let joins = [true, {
			includeTable,
			localField,
			operator,
			remoteField,
			type : type.toUpperCase()
		}];

		return adapter(this).queryBuilder({
			joins,
			model: this
		})
	}

	/*
	  update certain columns
	  ex Model.set({ name : "Raymundo" }).get()
	*/
	static set(data){
		return adapter(this).queryBuilder({
			data,
			model: this
		});
	}

	static toSql(){
		return adapter(this).queryBuilder({
			toSql : true,
			model: this
		}).get();
	}

	//relationships

	/*
	  eager load a relationship
	  ex Model.with('user').first()
	*/
	static with(...relationships) {
		let joins = {};
		relationships.map(rel => {
			let relationship = this;
			// if(!relationship[rel]){
				relationship = new relationship();
			// }
			return joins[rel] = relationship[rel](this);
		})
		return adapter(this).queryBuilder({
			joins,
			model: this
		})
	}

	static faker(){
		return adapter(this).fakerBuilder({
			model: this
		});
	}

	/*
	  One to One relationship
	  ex
	    export default class Chat extends Model {
	      user() {
	        return this.hasOne(User)
	      }
	    }
	    let user = await Chat.user
	*/

	hasOne(Model, localField = getFieldName(Model.name), remoteField = 'id') {
		let name = this.name || this.constructor.name;
		let snakeCase = this.snakeCase || this.constructor.snakeCase;
		let completeLocalField = `${getTableName(name, snakeCase)}.${localField}`;

		return {
			result: () => {
				let val = this.values;
				return Model.where({
					[remoteField]: val[localField]
				}).first();
			},
			includeTable: getTableName(Model.name, Model.snakeCase),
			localField : completeLocalField,
			remoteField: `${getTableName(Model.name, Model.snakeCase)}.${remoteField}`,
		}
	}

	/*
	  One to Many relationship
	  ex
	    export default class User extends Model {
	      chats() {
	        return this.hasMany(Chat)
	      }
	    }
	    let chats = await User.chats.limit(5).get()
	*/

	hasMany(Model, localField = 'id', remoteField = null) {
		let name = this.name || this.constructor.name;
		let snakeCase = this.snakeCase || this.constructor.snakeCase;
		let completeLocalField = `${getTableName(name, snakeCase)}.${localField}`;

		remoteField = remoteField || getFieldName(name);
		return {
			result: () => {
				let val = this.values;
				return Model.where({
					[remoteField]: val[localField] || val[completeLocalField]
				});
			},
			includeTable: getTableName(Model.name, Model.snakeCase),
			localField : completeLocalField,
			remoteField: `${getTableName(Model.name, Model.snakeCase)}.${remoteField}`,
		}
	}
}