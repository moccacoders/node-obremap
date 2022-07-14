const inquirer = require("inquirer");
const pluralize = require("pluralize");
const path = require("path");
const fs = require("fs");

const config = require("config");
const connection = require("cli/make/connection");
const lang = require("config/languages");
const questions = require("config/cli/questions.cli");
const utils = require("config/utils");
const chalk = require("chalk");

/**
 * @typedef {Object} ConfigurationData
 * @property {object} args - User-captured arguments
 * @property {string} cwd - Full path of the project
 * @property {object} obremapConfig - Obrempa configuration object
 */

/**
 * Create obremap model with options that users entered
 * @param {ConfigurationData} confgiData me as you like
 */
module.exports = ({ args, cwd, obremapConfig }) => {
  configuration(args).then((args) => {
    let modelName = utils.toCase(args["--name"], false, true);
    let options = "";
    Object.entries(args).map((arg, ind) => {
      let [key, val] = arg;
      if (
        /^_(.+)?/.test(key) ||
        [
          "--name",
          "--driver",
          "--how-import",
          "--wizard",
          "--folder",
          "--verbose",
        ].includes(key)
      )
        return true;
      key = utils.toCase(key.replace("--", "").replace("-", "_"), false);
      if (
        val == config.default[args["--driver"]][key] ||
        val ==
          utils.toCase(
            pluralize(args["--name"] || "default"),
            args["--snake-case"]
          )
      )
        return true;
      options += `static ${key} = ${typeof val == "string" ? `'${val}'` : val};
	`;
    });

    const template = fs
      .readFileSync(
        path.join(__dirname, `/templates/${args["--how-import"]}.template`),
        "utf8"
      )
      .replace("#__MODEL_NAME__#", modelName)
      .replace("#__CONFIGURATION__#", options);

    if (!args["--folder"])
      args["--folder"] =
        obremapConfig && obremapConfig.folders
          ? obremapConfig.folders.models
          : config.folders.models;
    if (!/^\//.test(args["--folder"]))
      args["--folder"] = `/${args["--folder"]}`;
    try {
      fs.accessSync(`${cwd}${args["--folder"]}`, fs.F_OK);
    } catch (e) {
      fs.mkdirSync(`${cwd}${args["--folder"]}`, { recursive: true });
    }

    let filePath = `${cwd}${args["--folder"]}/${utils.toCase(
      args["--name"]
    )}.model.js`;
    fs.writeFile(filePath, template, (err) => {
      if (err) throw err;
      console.log(chalk.green("Model created: "), filePath);
    });
  });
};

/**
 * Validate if user select wizard configuration or doesn't. If user doesn't select wizard configuration only done with args.
 * @param args - Receive all arguments of CLI
 * @returns {Promise} Promise object represents all args if user doesn't select wizard configuration or start the wizard configuration mode and return all user answers.
 */
const configuration = (args) => {
  return new Promise((done, error) => {
    if (!args["--wizard"]) return done(args);
    let answers = { ...args };
    let errorConnection = false;

    inquirer
      .prompt([...questions(answers).general, ...questions(answers).model])
      .then((ans) => {
        if (ans["--snake-case"])
          ans["--snake-case"] =
            ans["--snake-case"] == "snake_case" ? true : false;
        if (ans["--name"])
          ans["--name"] = utils.toCase(ans["--name"], false, true);
        if (ans["--table-name"])
          ans["--table-name"] = utils.toCase(
            ans["--table-name"],
            answers["--snake-case"]
          );
        if (ans["--connection"] != "default") {
          if (
            !process.env[`DB_${ans["--connection"].toUpperCase()}_HOST`] &&
            !process.env[`DB_${ans["--connection"].toUpperCase()}_URL`]
          )
            errorConnection = true;
          else errorConnection = false;

          try {
            if (!obremapConfig.databases[ans["--connection"]])
              errorConnection = true;
            else errorConnection = false;
          } catch (err) {
            errorConnection = true;
          }
        }

        answers = {
          ...answers,
          ...ans,
        };
        if (errorConnection) {
          answers["_createConnection"] = true;
          connection({ args: answers }).then((answers) => {
            done(answers);
          });
        } else done(answers);
      })
      .catch((err) => console.log(err));
  });
};
