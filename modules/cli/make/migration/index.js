const chalk = require("chalk");
const moment = require("moment");
const path = require("path");

const config = require("config");
const { getTableName } = require("global/get-name");
const Model = require("cli/make/model");
const utils = require("config/utils");
const Seeder = require("cli/make/seeder");

module.exports = ({ args, cwd, fs, obremapConfig }) => {
  let name = args["--name"];
  let type = "";
  let fields = [];
  let column,
    from,
    to,
    match,
    moveType,
    tableName = null;
  if (!args["--folder"])
    args["--folder"] =
      obremapConfig && obremapConfig.folders
        ? obremapConfig.folders.migrations
        : config.folders.migrations;
  if (!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
  let folderPath = path.join(cwd, args["--folder"]);
  try {
    let access = fs.accessSync(folderPath, fs.F_OK);
  } catch (e) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  let fileName = name;
  name = name.split("_");
  if (["create", "add", "rename", "move"].includes(name[0])) {
    type = name[0];
    delete name[0];
  }

  if (args["--fields"] && args["--fields"].length > 0) {
    args["--fields"].map((field) => {
      let options = field.split(",");
      let opts = 1;
      field = {};

      let names = ["type", "name"];
      Object.entries(options).map((obj) => {
        let [ind, value] = obj;
        let modifiers;
        let modLen = !field["modifiers"] ? 0 : field["modifiers"].length;
        let name = names[ind] ? names[ind] : `opt${opts}`;
        if (value.search(/\./) >= 0) {
          [value, ...modifiers] = value.split(/\./);
          modifiers.map((modifier) => {
            let val;
            if (modifier.search(/^(.+)-(.+)/) >= 0)
              [match, modifier, val] = modifier.match(/(.+)-(.+)/);

            if (!field["modifiers"]) field["modifiers"] = [];
            if (!field["modifiers"][modLen]) field["modifiers"][modLen] = {};
            field["modifiers"][modLen]["name"] = modifier;
            if (val) field["modifiers"][modLen]["value"] = val;
            modLen++;
          });
        }
        field[name] = value;
        if (field[`opt${opts}`]) opts++;
      });
      fields.push(field);
    });
  }

  // create_[tableName]_table [CREATE NEW TABLE]
  // add_[column]_to_[tableName]_table [ADD A NEW COLUMN TO TABLE]
  // move_[column]_after_[existingColumn]_on_[tableName]_table [MOVE COLUMN POSITION ON TABLE]
  // rename_[column]_to_[columnTo]_on_[tableName]_table [RENAME COLUMN ON TABLE]
  // rename_[tableName]_to_[tableNameTo]_table [RENAME TABLE]

  if (name[name.length - 1] == "table") {
    if (["rename", "move"].includes(type)) {
      if (name.includes("on")) type += "-column";
      else type += "-table";
    }
    delete name[name.length - 1];
  }

  name = name.filter((e) => e).join("_");
  if (name.search(/(_to_|_after_)/) >= 0) {
    [match, from, moveType, to] = name.match(/(.+)(_to_|_after_)(.+)/);
    moveType = moveType.replaceAll(/_/g, "");
    if (to.search(/_on_/) >= 0) {
      [match, tableName] = to.match(/_on_(.+)/);
      to = to.replace(/_on_(.+)/, "");
    }

    if (type == "add") {
      column = from;
      name = to;
    }
    if (tableName) name = tableName;
  }

  const moduleName =
    process.env.NODE_ENV == "test" ? "../dist" : "@moccacoders/node-obremap";
  tableName = args["--table-name"] || getTableName(name);
  const template = fs
    .readFileSync(
      path.join(__dirname, `templates/${args["--how-import"]}.template`),
      "utf8"
    )
    .replaceAll("#__MODEL_NAME__#", utils.toCase(fileName, false, true))
    .replaceAll("#__TABLE_NAME__#", "tableName")
    .replaceAll("#__MODULE_NAME__#", moduleName)
    .replace(
      "#__UP__#",
      processUp({ type, tableName, column, from, to, fields })
    )
    .replace(
      "#__DOWN__#",
      processDown({ type, tableName, column, from, to, fields })
    );

  let filePath = path.join(
    folderPath,
    `/${moment().format("YYYY_MM_DD_HHmmss")}_${utils.toCase(
      fileName
    )}.migration.js`
  );
  try {
    fs.writeFileSync(filePath, template);
    console.log(chalk.green("Migration created: "), filePath);

    args["--name"] = name;
    if (args["--seeder"]) {
      delete args["--folder"];
      Seeder({ args, cwd, fs, obremapConfig });
    }

    if (args["--model"] === true) {
      args["_type"] = "model";
      delete args["--folder"];
      delete args["--model"];
      delete args["--seeder"];
      Model({ args, cwd, obremapConfig });
    }
  } catch (error) {}
};

const processUp = ({ type, tableName, column, from, to, fields }) => {
  let template = `//`;
  switch (type) {
    case "create":
      template = `Schema.create('${tableName}', table => {${
        fields.length > 0
          ? `${processFields(fields)}
		`
          : `
			table.id();
			table.string('name');
			table.timestamps();
		`
      }})`;
      break;

    case "add":
      template = `Schema.table('${tableName}', table => {
			table.string('${column}');
		})`;
      break;

    case "rename-table":
      template = `Schema.rename('${from}', '${to}')`;
      break;

    case "rename-column":
      template = `Schema.table('${tableName}', table => {
			table.renameColumn('string', '${from}', '${to}');
		})`;
      break;

    case "move-column":
      if (from && to)
        template = `Schema.table('${tableName}', table => {
          table.moveColumn('string', '${from}', '${to}');
        })`;
      break;
  }
  return template;
};

const processDown = ({ type, tableName, column, from, to, fields }) => {
  let template = `//`;
  switch (type) {
    case "create":
      template = `Schema.dropIfExists('${tableName}')`;
      break;

    case "add":
      template = `Schema.table('${tableName}', table => {
			table.dropColumn('${column}');
		})`;
      break;

    case "rename-table":
      template = `Schema.rename('${to}', '${from}')`;
      break;

    case "rename-column":
      template = `Schema.table('${tableName}', table => {
			table.renameColumn('string', '${to}', '${from}');
		})`;
      break;
    case "move-column":
      if (from && to) {
        template = `Schema.table('${tableName}', table => {
          // Replace #__EXISTING_COLUMN_NAME__# for correct column name to roll back
          table.moveColumn('string', '${to}', '#__EXISTING_COLUMN_NAME__#');
        })`;
      }
      break;
  }

  return template;
};

const processFields = (fields) => {
  let str = ``;
  fields.map((field) => {
    let { type, name, modifiers, ...opts } = field;
    str += `
			table.${type}(${name ? `'${name}'` : ""}${
      Object.entries(opts).length > 0
        ? Object.entries(opts)
            .map((opt, ind) => {
              return `${ind == 0 ? ", " : ""}${
                !isNaN(opt[1]) ? opt[1] : `'${opt[1]}'`
              }`;
            })
            .join(", ")
        : ""
    })${
      modifiers
        ? modifiers
            .map((mod, ind) => {
              return `${ind == 0 ? "." : ""}${mod.name}(${
                mod.value
                  ? `${
                      !isNaN(mod.value) ||
                      mod.value == "true" ||
                      mod.value == "false"
                        ? mod.value
                        : `'${mod.value}'`
                    }`
                  : ""
              })`;
            })
            .join(".")
        : ""
    };`;
  });
  return str;
};
