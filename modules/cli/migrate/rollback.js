const chalk = require("chalk");
const Reset = require("./reset.js")
const DB = require("../../index").DB;

exports.default = ({ args, cwd, fs, obremapConfig, exit = true }) => {
	if(!args["--folder"]) args["--folder"] = obremapConfig && obremapConfig.folders ? obremapConfig.folders.migrations : config.folders.migrations;
	args["--rollback"] = true;
	if(!args["--step"]){
		let migration = DB.table("migrations").orderBy("id desc").firstSync();
		if(!migration){
			console.log(chalk.green(`Nothing to Rolling Back on "${args["--folder"]}"`));
			process.exit();
		}
		args["--batch"] = migration.batch;		
	}

	Reset.default({ args, cwd, fs, obremapConfig })
	if(exit) process.exit();
}