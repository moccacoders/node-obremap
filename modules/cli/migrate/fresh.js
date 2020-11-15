const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const inquirer = require("inquirer")
const root = require("app-root-path");
const Migrate = require("./index")
const Seed = require("../seed/index")
const DB = require("../../index").DB
const config = require("../../config");
const questions = require("../../config/cli/questions.cli.js")
let obremapConfig = {};

try{
	obremapConfig = require(path.join(root.path, "/obremap.config.js"));
}catch(err){ }

exports.default = ({ args, cwd, fs }) => {
	if(!args["--force"] && process.env.NODE_ENV == "production")
		inquirer.prompt(questions(args).migrations)
		.then(args => {
			if(args["--force"] == true){
				exports.start({ args, cwd, fs })
			}else{
				return console.log("Fresh process canceled by user", chalk.green(`successfully`));
			}
		})
		.catch(err => console.log(chalk.red("Error:"), err.message))
	else
		exports.start({ args, cwd, fs });
}

exports.start = ({ args, cwd, fs }) => {
	let dropTables = exports.dropTables();
	if(dropTables){
		Migrate.default({ args, cwd, fs, exit: !args["--seed"]})
		if(args["--seed"]){
			delete args["--folder"]
			Seed.default({ args, cwd, fs })
		}
	}
}

exports.dropTables = () => {
	let connection = DB.connection != "default" ? DB.connection : "";
	let database = null;
	if(obremapConfig && obremapConfig.databases){
		database = obremapConfig.databases[DB.connection];
		if(database.database)
			database = database.database
		else {
			database = new URL(database)
			database = database.pathname.slice(1);
		}
	} else if (process.env[`DATABASE_URL_${connection}`]) {
		database = new URL(process.env[`DATABASE_URL_${connection}`])
		database = database.pathname.slice(1);
	} else if (process.env[`DB_${connection}_NAME`]) {
		database = process.env[`DB_${connection}_NAME`];
	}

	let tables = DB.sqlSync(`SELECT table_name FROM information_schema.tables WHERE table_schema = ?`, [database])
	tables = tables.map(table => table.TABLE_NAME)
	if(tables.length == 0){
		console.log("Droped all tables", chalk.green("successfully."));
		return true;
	}
	let sql = `drop table \`${tables.join("`, `")}\`;`;
	try{
		let drop = DB.sqlSync(sql);
		console.log("Droped all tables", chalk.green("successfully."));
		return true;
	}catch(err){console.log(err)}
	return false;
}