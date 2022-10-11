const chalk = require("chalk");
const Migrate = require("cli/migrate");
const Reset = require("cli/migrate/reset");

exports.default = async ({ args, cwd, fs, obremapConfig }) => {
  console.log(chalk.bold("==== ROLLING BACK MIGRATIONS ===="));
  await Reset.default({ args, cwd, fs, obremapConfig, exit: false });

  console.log(chalk.bold("==== RUN MIGRATIONS ===="));
  await Migrate.default({ args, cwd, fs, obremapConfig });
};
