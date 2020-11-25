import adapter from './adapters';
import { getTableName, getFieldName } from '../global/get-name';

export default class Schema {
	static tableName = null;
	static connection = "default";
	static timestamps = false;

	constructor () {
		if(typeof this.constructor.run === "undefined")
			throw Error(`Method [run] missing from ${this.constructor.name}`);
		
		return this.container ?
			this.container.call([this, "run"]) :
			this.constructor.run()
	}
	
	static create (tableName, action) {
		this.tableName = tableName;
		this.schemaBuilder = adapter(this).schemaBuilder({ model : this })
		action(this.schemaBuilder)

		try{
			let createTable = adapter(this).createTable(this.schemaBuilder)
			return createTable
		}catch(err){ throw err }
	}

	static dropIfExists (tableName) {
		return this.drop(tableName, true)
	}

	static drop (tableName, ifExists = false) {
		this.tableName = tableName;
		this.schemaBuilder = adapter(this).schemaBuilder({ model : this })
		this.schemaBuilder.options.ifExists = ifExists;
		try{
			let createTable = adapter(this).dropTable(this.schemaBuilder)
			return createTable
		}catch(err){
			return err
		}
	}

	static table (tableName, action) {
		this.tableName = tableName;
		this.schemaBuilder = adapter(this).schemaBuilder({ model : this })
		action(this.schemaBuilder)

		try{
			let createTable = adapter(this).alterTable(this.schemaBuilder)
			return createTable
		}catch(err){ throw err }
	}
}