const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const root = require("app-root-path");
const config = require("../../config");
let obremapConfig = {};

try{
	obremapConfig = require(path.join(root.path, "/obremap.config.js"));
}catch(err){ }

export default ({ args, cwd, fs, exit = true }) => {
	if(!args["--folder"]) args["--folder"] = obremapConfig.folders ? obremapConfig.folders.seeders : config.folders.seeders;
	let folderPath = path.join(cwd, args["--folder"]);
	let containerPath = path.join(folderPath, "container.seeder.js");
	let seeds = {};
	try{
		fs.readFileSync(containerPath).toString();
		let Container = require(containerPath);
		Container = new Container();
		console.log(chalk.green("Database seeding completed successfully."));
	}catch(err){ console.log(chalk.red("Error:"), err.message) }
	if(exit) process.exit();
}