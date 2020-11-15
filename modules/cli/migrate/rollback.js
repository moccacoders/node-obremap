const chalk = require("chalk");
const Reset = require("./reset.js")
const DB = require("../../index").DB;

exports.default = ({ args, cwd, fs }) => {
	args["--rollback"] = true;
	if(!args["--step"]){
		let migration = DB.table("migrations").orderBy("id desc").firstSync();
		if(!migration)
			return console.log(chalk.green(`Nothing to Rolling Back on "${args["--folder"]}"`));
		args["--batch"] = migration.batch;		
	}

	Reset.default({ args, cwd, fs })
}