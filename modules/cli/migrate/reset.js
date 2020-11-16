const config = require("../../config");
const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const DB = require("../../index").DB;
const Migrate = require("./index.js")

exports.default = ({ args, cwd, fs, exit = true, obremapConfig }) => {
	if(!args["--folder"]) args["--folder"] = obremapConfig && obremapConfig.folders ? obremapConfig.folders.migrations : config.folders.migrations;
	if(!args["--batch"]) args["--batch"] = 0;
	if(!args["--step"]) args["--step"] = 0;
	try{
		let [files, batch] = Migrate.migrations(files, true, args["--batch"], args["--step"])
		if(files.length == 0){
			console.log(chalk.green(`Nothing to Rolling Back on "${args["--folder"]}"`));
		}

		files.forEach(file => {
			try{
				let filePath = path.join(cwd, args["--folder"], file.migration);
				let Migration = require(filePath);
				console.log(chalk.yellow("Rolling Back:"), file.migration);
				let start = moment(new Date());
				Migration = new Migration();
				Migration = Migration.down();

				DB.table("migrations").where({ id : file.id }).deleteSync()
				let end = moment(new Date());
				let diff = end.diff(start, "seconds");

				console.log(chalk.green("Rolled Back:"), file.migration, `(${diff} seconds)`);
			}catch(err){
				if(err.message.search("Cannot find module") >= 0)
					console.log(chalk.red("Migration not found:"), file.migration)
			}
		});
		if(exit) return process.exit()
	}catch(err){
		if(err.message.search("no such file or directory") >= 0)
			return console.log(chalk.green(`Nothing to migrate on "${args["--folder"]}"`));
		console.log(chalk.red("Error:"), err.message)
	}
}