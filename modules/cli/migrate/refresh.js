const chalk = require("chalk");
const Migrate = require("./index.js")
const Reset = require("./reset.js")

exports.default = ({ args, cwd, fs, obremapConfig }) => {
	console.log(chalk.bold("==== ROLLING BACK MIGRATIONS ===="))
	Reset.default({ args, cwd, fs, obremapConfig, exit : false })
	console.log(chalk.bold("==== RUN MIGRATIONS ===="))
	Migrate.default({ args, cwd, fs, obremapConfig })
}