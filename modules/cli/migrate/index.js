const chalk = require("chalk");
const path = require("path");

const config = require("config");
const { DB, Schema } = require("/");
const { microtime } = require("config/utils.js");

exports.default = async ({ args, cwd, fs, exit = true, obremapConfig }) => {
  if (!args["--folder"])
    args["--folder"] =
      obremapConfig && obremapConfig.folders
        ? obremapConfig.folders.migrations
        : config.folders.migrations;
  try {
    let files = fs.readdirSync(path.join(cwd, args["--folder"])).sort();
    if (args["--path"]) files = args["--path"];
    let batch = 0;

    const migrations = await exports.migrations({ files, obremapConfig });
    files = migrations.files;
    batch = migrations.batch;
    if (files.length == 0) {
      console.log(chalk.green(`Nothing to migrate on "${args["--folder"]}"`));
    }

    for (const file of files) {
      console.log(chalk.yellow("Migrating:"), file);
      let startTime = microtime(true);
      let filePath = path.join(
        cwd,
        file.search(args["--folder"]) >= 0 ? "" : args["--folder"],
        file
      );

      let Migration = require(filePath);
      Migration = await Migration.up();

      const insert = await DB.table("migrations")
        .setTimestamps(false)
        .set("migration", file)
        .set("batch", batch + 1)
        .insert();

      let runTime = parseFloat(microtime(true) - startTime).toFixed(2);
      console.log(chalk.green("Migrated:"), file, `(${runTime} seconds)`);
    }
  } catch (err) {
    if (err.message.search("no such file or directory") >= 0)
      return console.log(
        chalk.green(`Nothing to migrate on "${args["--folder"]}"`)
      );

    console.log(chalk.red("Errores: "), err);
    if (global.dev) console.log(err);
  }
};

const migrations = async ({
  files,
  reset = false,
  batch = 0,
  step = 0,
  obremapConfig,
}) => {
  let connection = DB.connection != "default" ? DB.connection : "";
  let database = null;
  if (!files) files = [];
  if (obremapConfig && obremapConfig.databases) {
    database = obremapConfig.databases[DB.connection];
    if (database.database) database = database.database;
    else {
      database = new URL(database);
      database = database.pathname.slice(1);
    }
  } else if (process.env[`DATABASE_URL_${connection}`]) {
    database = new URL(process.env[`DATABASE_URL_${connection}`]);
    database = database.pathname.slice(1);
  } else if (process.env[`DB_${connection}_NAME`]) {
    database = process.env[`DB_${connection}_NAME`];
  }

  let migrationTable = await DB.table("information_schema.tables")
    .select("table_name")
    .where("table_schema", database)
    .where("table_name", "migrations")
    .exists();

  if (!migrationTable) {
    try {
      await Schema.create("migrations", (table) => {
        table.id();
        table.string("migration", 255);
        table.integer("batch", 11);
      });
      console.log("Migration table created", chalk.green("successfully."));
    } catch (err) {
      console.log("There was an error migrating.", err.message);
    }
  } else {
    console.log("Migration table already", chalk.green("exists."));
  }

  let all = DB.table("migrations");
  if (batch > 0) all = all.where({ batch });
  if (step > 0) all = all.limit(step);
  files.map((file, ind) => {
    if (ind == 0) all = all.where(`migration`, file);
    else all = all.orWhere(`migration`, file);
  });
  if (reset) all = all.orderBy("id", "desc");
  all = await all.get();

  if (!reset) {
    if (all.length > 0)
      files = files.filter((ele) => !all.map((e) => e.migration).includes(ele));
    batch =
      all.length > 0
        ? Math.max.apply(
            0,
            all.map((ele) => ele.batch)
          )
        : 0;
  } else files = all;
  return { files: files.filter((i) => i), batch };
};

exports.migrations = migrations;
