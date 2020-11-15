import Model from "./model";
import adapter from './adapters'

export default class DB extends Model {
	static timestamps = true;
	static connection = "default";
	static sync = true;

	static table (tableName) {
		this.tableName = tableName;
		return adapter(this).queryBuilder({
			model: this,
			sync : this.sync
		})
	}

	static connection (connection) {
		this.connection = connection;
		return adapter(this).queryBuilder({
			model: this,
			sync : this.sync
		})
	}

	static truncate (tableName) {
		this.tableName = tableName;
		return adapter(this).truncateTable(this);
	}

	static dropIfExists (tableName) {
		return this.drop(tableName, true)
	}

	static drop (tableName, ifExists = false) {
		this.tableName = tableName;
		let schemaBuilder = adapter(this).schemaBuilder({ model : this })
		schemaBuilder.options.ifExists = ifExists;
		try{
			return adapter(this).dropTable(schemaBuilder)
			return createTable
		}catch(err){
			return err
		}
	}
}