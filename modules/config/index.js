export default {
	drivers : [
		"mysql"
	],
	default : {
		driver : "mysql",
		mysql : {
			snakeCase : true,
			tableName : null,
			primaryKey : "id",
			incrementing : true,
			keyType : "int",
			timestamps : true,
			dateFormat : "TIMESTAMP",
			createdAt : "created_at",
			updatedAt : "updated_at",
			connection : "default",
			port : 3306
		},
		connection : {
			setConnection : true,
			configFile : true,
			multiConnections : false,
			urlConfig : true,
			url : true,
			hostname : "localhost",
			username : "root",
			password : "root",
			database : "database",
			connectionName : "default",
			moreConnections : true
		}
	},
	choices : {
		mysql : {
			keyType: [
				"tinyint",
				"smallint",
				"mediumint",
				"int",
				"bigint",
				"decimal",
				"float",
				"double",
				"bit",
				"char",
				"varchar",
				"binary",
				"varbinary",
				"tinyblob",
				"blob",
				"mediumblob",
				"longblob",
				"tinytext",
				"text",
				"mediumtext",
				"longtext",
				"enum",
				"set",
				"date",
				"time",
				"datetime",
				"timestamp",
				"year",
				"geometry",
				"point",
				"linestring",
				"polygon",
				"geometrycollection",
				"multilinestring",
				"multipoint",
				"multipolygon",
				"json",
				"boolean / bool"
			]
		}
	}
}