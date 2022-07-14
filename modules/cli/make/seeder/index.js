const chalk = require("chalk");
const path = require("path");

const config = require("config");
const { getTableName } = require("global/get-name");
const model = require("cli/make/model");
const utils = require("config/utils");

module.exports = ({ args, cwd, fs, obremapConfig }) => {
  let name = args["--name"].replace(
    /_?(table|create|add|rename-table|rename-column)_?/g,
    ""
  );
  let fields = [];
  if (!args["--folder"])
    args["--folder"] =
      obremapConfig && obremapConfig.folders
        ? obremapConfig.folders.seeders
        : config.folders.seeders;
  if (!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
  let folderPath = path.join(cwd, args["--folder"]);
  const fileName = utils.toCase(name.replace(/(_|\-|\.)?seeder/i, ""));
  const filePath = path.join(folderPath, `/${fileName}.seeder.js`);

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
            let val, match;
            if (modifier.search(/(.+)-(.+)/) >= 0)
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

  try {
    if (fs.existsSync(filePath)) {
      console.log(
        chalk.yellow("Warning."),
        `Seeder ('${fileName}.seeder.js') already exists.`,
        chalk.bold("Seeder not created.")
      );
      return false;
    }
  } catch (e) {}

  if (!createSeederContainer({ args, cwd, fs })) return false;

  const className = utils.toCase(name, false, true);
  const tableName =
    args["--table-name"] || getTableName(name.replace(/(_|\-|\.)?seeder/i, ""));
  const template = fs
    .readFileSync(
      path.join(__dirname, `templates/seeder/${args["--how-import"]}.template`),
      "utf8"
    )
    .replaceAll("#__SEEDER_NAME__#", className)
    .replaceAll("#__TABLE_NAME__#", tableName)
    .replaceAll(
      "#__TIMESTAMPS__#",
      fields.filter((field) => field.type.search("timestamp") >= 0).length > 0
    )
    .replaceAll(
      "#__FIELDS__#",
      fields.length > 0
        ? processFields(fields)
        : `name : 'John',
                    last_name : 'Doe',
                    email : 'john.doe@example.com'`
    );

  fs.writeFile(filePath, template, (err) => {
    if (err) throw err;
    console.log(chalk.green("Seeder created: "), filePath);
  });

  if (args["--model"] === true) {
    model({ args, cwd, fs });
  }
};

const createSeederContainer = ({ args, cwd, fs }) => {
  let folderPath = path.join(cwd, args["--folder"]);
  let containerPath = path.join(folderPath, "/container.seeder.js");
  let name = args["--name"];
  let fileName = utils.toCase(name.replace(/seeder/i, ""));
  let className = [utils.toCase(name, false, true)];
  let importClass = [
    `${
      args["--how-import"] == "import"
        ? `import ${className[0]} from './${fileName}.seeder'`
        : `const ${className[0]} = require('./${fileName}.seeder')`
    };`,
  ];

  try {
    try {
      fs.accessSync(folderPath, fs.F_OK);
    } catch (e) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (fs.existsSync(containerPath)) {
      const container = fs.readFileSync(containerPath, "utf8");
      [
        ...container.matchAll(
          /import ((?!\{(\s+)?Seeder(\s+)?\}).+) from (('|")(.+)('|"))|(const|var|let) ((?!\{(\s+)?Seeder(\s+)?\}).+) = require(\s+)?\((('|")(.+)('|")\));?/gi
        ),
      ].map((match) => {
        if (!importClass.find((ele) => ele === match[0]))
          importClass.push(match[0]);
        if (!className.find((ele) => ele === match[1]))
          className.push(match[1]);
        return { import: match[0], name: match[1] };
      });
    }
    const template = fs
      .readFileSync(
        path.join(
          __dirname,
          `templates/container/${args["--how-import"]}.template`
        ),
        "utf8"
      )
      .replace("#__IMPORTS__#", importClass.sort().join("\r"))
      .replace("#__CALLS__#", className.sort().join(",\r\t\t\t"));
    fs.writeFileSync(containerPath, template, { recursive: true });
    console.log(chalk.green("Container created:"), containerPath);
    return true;
  } catch (err) {
    console.log(chalk.yellow("Error: "), err.message);
    return false;
  }
};

const processFields = (fields) => {
  let str = ``;
  fields.map((field) => {
    let { type, name, modifiers, ...opts } = field;
    if (name)
      str += `
					${name} : ${type.search(/(id|int)/) >= 0 ? 0 : `''`}`;
  });
  return str;
};
