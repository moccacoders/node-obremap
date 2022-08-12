const chalk = require("chalk");
const path = require("path");
const moment = require("moment");
const inquirer = require("inquirer");
const Migrate = require("./index");
const Seed = require("../seed/index");
const { DB, Schema } = require("../../index");
const config = require("../../config");
const questions = require("../../config/cli/questions.cli.js");
const { emit } = require("process");

exports.default = ({ args, cwd, fs, obremapConfig }) => {
  if (!args["--force"] && process.env.NODE_ENV == "production")
    inquirer
      .prompt(questions(args).migrations)
      .then((args) => {
        if (args["--force"] == true) {
          exports.start({ args, cwd, fs, obremapConfig });
        } else {
          return console.log(
            "Fresh process canceled by user",
            chalk.green(`successfully`)
          );
        }
      })
      .catch((err) => console.log(chalk.red("Error:"), err.message));
  else exports.start({ args, cwd, fs, obremapConfig });
};

exports.start = async ({ args, cwd, fs, obremapConfig }) => {
  let dropTables = await exports.dropTables(obremapConfig);
  if (dropTables) {
    await Migrate.default({
      args,
      cwd,
      fs,
      obremapConfig,
      exit: !args["--seed"],
    });
    if (args["--seed"]) {
      delete args["--folder"];
      Seed.default({ args, cwd, fs, obremapConfig });
    }
  }
};

exports.dropTables = async (obremapConfig) => {
  let errors = [];
  let connection = DB.connection != "default" ? DB.connection : "default";
  let database = null;
  if (obremapConfig && obremapConfig.databases) {
    database = obremapConfig.databases[DB.connection];
    if (database.database) database = database.database;
    else {
      database = new URL(database);
      database = database.pathname.slice(1);
    }
  } else if (
    process.env[`DATABASE_URL_${connection}`] ||
    process.env[`DATABASE_URL`]
  ) {
    database = new URL(
      process.env[`DATABASE_URL_${connection}`] || process.env[`DATABASE_URL`]
    );
    database = database.pathname.slice(1);
  } else if (process.env[`DB_${connection}_NAME`]) {
    database = process.env[`DB_${connection}_NAME`];
  }

  let tables = await DB.table("information_schema.tables")
    .select("table_name")
    .where("table_schema", database)
    .get();

  tables = tables.map((table) =>
    table.TABLE_NAME ? table.TABLE_NAME : table.table_name
  );

  if (tables.length == 0) {
    console.log(chalk.yellow("There are no tables to drop"));
    return true;
  }

  for (const table of tables) {
    try {
      let drop = await Schema.dropIfExists(table);
      if (drop.constructor.name === "OkPacket")
        tables = tables.filter((ele) => ele != table);
    } catch (err) {
      errors.push(err);
    }
  }

  if (errors.length > 0) throw errors;
  if (tables.length === 0) {
    console.log("Droped all tables", chalk.green("successfully."));
    return true;
  } else return false;
};
