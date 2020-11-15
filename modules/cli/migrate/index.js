const config = require("../../config");
const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const root = require("app-root-path");
const { DB } = require("../../index");
let obremapConfig = {};

try{
	obremapConfig = require(path.join(root.path, "/obremap.config.js"));
}catch(err){ }

exports.default = ({ args, cwd, fs, exit = true }) => {
	if(!args["--folder"]) args["--folder"] = obremapConfig.folders ? obremapConfig.folders.migrations : config.folders.migrations;
	try{
		let files = fs.readdirSync(path.join(root.path, args["--folder"])).sort();
		let batch = 0;

		[files, batch] = exports.migrations(files)
		if(files.length == 0){
			console.log(chalk.green(`Nothing to migrate on "${args["--folder"]}"`));
		}

		files.forEach(file => {
			console.log(chalk.yellow("Migrating:"), file);
			let start = moment(new Date());
			let filePath = path.join(root.path, args["--folder"], file);
			let Migration = require(filePath);
			Migration = new Migration();
			Migration = Migration.up();

			DB.table("migrations").timestamps(false).create({
				migration : file,
				batch: batch + 1
			})

			let end = moment(new Date());
			let diff = end.diff(start, "seconds");

			console.log(chalk.green("Migrated:"), file, `(${diff} seconds)`);
		});
		if(exit) return process.exit()
	}catch(err){
		console.log(chalk.red("Error: "), err.message);
		process.exit(1)
		if(err.message.search("no such file or directory") >= 0)
			return console.log(chalk.green(`Nothing to migrate on "${args["--folder"]}"`));
	}
}

const migrations = (files, reset=false, batch=0, step=0) => {
	let connection = DB.connection != "default" ? DB.connection : "";
	let database = null;
	if(!files) files = [];
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

	let migrationTable = DB.sqlSync(`SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`, [database, "migrations"])
	if(migrationTable.length == 0){
		try{
			DB.sqlSync(`CREATE TABLE \`migrations\` ( \`id\` int(10) unsigned NOT NULL AUTO_INCREMENT, \`migration\` varchar(255) NOT NULL, \`batch\` int(11) NOT NULL, PRIMARY KEY (\`id\`) )`)
		console.log("Migration table created", chalk.green("successfully."));
		}catch(err){console.log(err)}
	}

	let all = DB.table("migrations");
	if(batch>0) all = all.where({ batch })
	if(step>0) all = all.limit(step)
	files.map((file, ind) => {
		if(ind == 0)
			all = all.where(`(migration = '${file}'`);
		else
			all = all.orWhere(`migration = '${file}'${ind==files.length-1? ")" : ""}`)
	})
	if(reset) all = all.orderBy("id desc")
	all = all.getSync()
	if(!reset){
		all.map(item => {
			files.map((ele, ind) => {
				if(ele == item.migration) delete files[ind]
			})
			batch = item.batch;
		})
	}else
		files = all
	return [files.filter(i=>i), batch];
}

exports.migrations = migrations;