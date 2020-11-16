const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const config = require("../../config");

export default ({ args, cwd, fs, exit = true, obremapConfig }) => {
	if(!args["--folder"]) args["--folder"] = obremapConfig && obremapConfig.folders ? obremapConfig.folders.seeders : config.folders.seeders;
	let folderPath = path.join(cwd, args["--folder"]);
	let containerPath = path.join(folderPath, "container.seeder.js");
	let seeds = {};
	fs.readFileSync(containerPath).toString();
	let Container = require(containerPath);
	Container = new Container();
	console.log(chalk.green("Database seeding completed successfully."));
	if(exit) process.exit();
}