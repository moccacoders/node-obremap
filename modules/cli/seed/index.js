const chalk = require("chalk");
const path = require("path");

const config = require("config");

export default async ({ args, cwd, fs, exit = true, obremapConfig }) => {
  if (!args["--folder"])
    args["--folder"] =
      obremapConfig && obremapConfig.folders
        ? obremapConfig.folders.seeders
        : config.folders.seeders;

  let folderPath = path.join(cwd, args["--folder"]);
  let containerPath = path.join(folderPath, "container.seeder.js");
  fs.readFileSync(containerPath).toString();

  let Container = require(containerPath);
  await Container.run();

  process.exit(1);
  Container = new Container();
  console.log(chalk.green("Database seeding completed successfully."));
  if (exit) process.exit();
};
