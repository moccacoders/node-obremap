const config = require("../../config");
const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const { DB } = require("../../index");
const { microtime } = require('../../config/utils.js')

exports.default = ({ args, cwd, fs, exit = true, obremapConfig }) => {
	if(!args["--folder"]) args["--folder"] = obremapConfig && obremapConfig.folders ? obremapConfig.folders.migrations : config.folders.migrations;
	try{
		let files = fs.readdirSync(path.join(cwd, args["--folder"])).sort();
		if(args["--path"]) files = args["--path"];
		let batch = 0;
		console.log(args["--path"]);

		[files, batch] = exports.migrations({files, obremapConfig})
		if(files.length == 0){
			console.log(chalk.green(`Nothing to migrate on "${args["--folder"]}"`));
		}

		files.forEach(file => {
			console.log(chalk.yellow("Migrating:"), file);
			let startTime = microtime(true)
			let filePath = path.join(cwd, (file.search(args["--folder"]) >= 0) ? "" : args["--folder"], file);
			let Migration = require(filePath);
			Migration = new Migration();
			Migration = Migration.up();

			DB.table("migrations").timestamps(false).create({
				migration : file,
				batch: batch + 1
			})

			let runTime = parseFloat(microtime(true) - startTime).toFixed(2);
			console.log(chalk.green("Migrated:"), file, `(${runTime} seconds)`);
		});
		if(exit) return process.exit()
	}catch(err){
		if(err.message.search("no such file or directory") >= 0)
			return console.log(chalk.green(`Nothing to migrate on "${args["--folder"]}"`));

		console.log(chalk.red("Errores: "), err.message);
		if(global.dev) console.log(err);
		process.exit(1)
	}
}

const migrations = ({files, reset=false, batch=0, step=0, obremapConfig}) => {
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
		}catch(err){console.log("Migration table already", chalk.green("exists."));}
	}

	let all = DB.table("migrations");
	if(batch>0) all = all.where({ batch })
	if(step>0) all = all.limit(step)
	files.map((file, ind) => {
		if(ind == 0)
			all = all.where(`(migration = '${file}'${files.length-1==0 ? ")" : ""}`);
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