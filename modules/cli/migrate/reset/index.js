const chalk = require("chalk");
const path = require("path");
const moment = require("moment");

const config = require("config");
const { DB } = require("/");
const Migrate = require("cli/migrate");

exports.default = async ({ args, cwd, fs, exit = true, obremapConfig }) => {
  if (!args["--folder"])
    args["--folder"] =
      obremapConfig && obremapConfig.folders
        ? obremapConfig.folders.migrations
        : config.folders.migrations;
  if (!args["--batch"]) args["--batch"] = 0;
  if (!args["--step"]) args["--step"] = 0;
  try {
    let { files, batch } = await Migrate.migrations({
      files: [],
      reset: true,
      batch: args["--batch"],
      step: args["--step"],
      obremapConfig,
    });
    if (files.length == 0) {
      console.log(
        chalk.green(`Nothing to Rolling Back on "${args["--folder"]}"`)
      );
    }

    for (const file of files) {
      try {
        let filePath = path.join(
          cwd,
          file.migration.search(args["--folder"]) >= 0 ? "" : args["--folder"],
          file.migration
        );
        console.log(chalk.yellow("Rolling Back:"), file.migration);
        let start = moment(new Date());

        let Migration = require(filePath);
        Migration = await Migration.down();

        const deleted = await DB.table("migrations")
          .where({ id: file.id })
          .delete();
        let end = moment(new Date());
        let diff = end.diff(start, "seconds");

        console.log(
          chalk.green("Rolled Back:"),
          file.migration,
          `(${diff} seconds)`
        );
      } catch (err) {
        if (err.message.search("Cannot find module") >= 0)
          console.log(chalk.red("Migration not found:"), file.migration);
        else console.log(chalk.red("Error:"), err.message);
        if (global.dev) console.log(err);
      }
    }
  } catch (err) {
    if (err.message.search("no such file or directory") >= 0)
      return console.log(
        chalk.green(`Nothing to migrate on "${args["--folder"]}"`)
      );
    console.log(chalk.red("Error:"), err.message);
    console.log(err);
    if (global.dev) console.log(err);
  }
};
