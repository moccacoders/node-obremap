const chalk = require("chalk");

const config = require("config");
const Reset = require("cli/migrate/reset");
const { DB } = require("/");

exports.default = async ({ args, cwd, fs, obremapConfig, exit = true }) => {
  if (!args["--folder"])
    args["--folder"] =
      obremapConfig && obremapConfig.folders
        ? obremapConfig.folders.migrations
        : config.folders.migrations;
  args["--rollback"] = true;
  if (!args["--step"]) {
    let migration = await DB.table("migrations").orderBy("id", "desc").first();
    if (!migration) {
      console.log(
        chalk.green(`Nothing to Rolling Back on "${args["--folder"]}"`)
      );
      process.exit();
    }
    args["--batch"] = migration.batch;
  }

  await Reset.default({ args, cwd, fs, obremapConfig });
  if (exit) process.exit();
};
