require("dotenv").config();
const root = require("app-root-path");
const path = require("path");

export default (model) => {
	try {
		global.dbConn = dbConfig(model.connection);
		return require(`./${global.dbConn.driver}`).default
	} catch(e) {
		// console.log(e.message);
		throw new Error('You must specify process.env.DB_DRIVER before creating a model.')
	}
}

export const dbConfig = (connection) => {
	let databases = {};
	let configFile = null;

	try{
		configFile = require(path.join(root.path, "/obremap.config.js"));
	}catch(e){
		configFile = null;
	}

	if(configFile && configFile.databases){
		databases = configFile.databases;
		global.TZ = configFile.timezone || null;
	}

	if(!configFile)
		Object.entries(process.env).map((elem, ind) => {
			const [key, value] = elem;
			
			// DATABASE URL
			const url = key.match(/DATABASE_URL([\w]+)?/i);
			if(url){
				let params = new URL(value);
				let name = url[1] ? url[1].slice(1).toLowerCase() : "default";

				databases[name] = {
					host : params.hostname,
					user : params.username,
					password : params.password,
					database : params.pathname.slice(1),
					port: params.port || 3306,
					driver : params.protocol.replace(":", "")
				};
			}

			// DB
			const db = key.match(/DB([\w]+)?_([\w]+)/i);
			if(db){
				let name = db[1] ? db[1].slice(1).toLowerCase() : "default";
				let prop = (db[2] == "NAME" ? "database" : db[2] == "USERNAME" ? "user" : db[2]).toLowerCase();
				if(!databases[name]) databases[name] = {};
				databases[name][prop] = value;

			}
		})

	if(typeof databases[connection] == "string"){
		let params = new URL(databases[connection]);
		return {
			host : params.hostname,
			user : params.username,
			password : params.password,
			database : params.pathname.slice(1),
			port: params.port || 3306,
			driver : params.protocol.replace(":", "")
		};
	}
	return databases[connection];
}