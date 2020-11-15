const fs = require("fs");
const path = require("path");
const pluralize = require("pluralize");
const root = require("app-root-path");

const config = require('../index.js');
const configPath = path.join(root.path, "/obremap.config.js");
let lang = require('../languages');
const utils = require('../utils');
let configFile = {};
try{
	configFile = require(configPath)
}catch(err){}

module.exports = answers => {
	return {
		general : [
			{
				name : "_lang",
				message: "What language do you prefer? | ¿Cuál idioma prefieres?",
				type : "list",
				choices: [
					"english",
					"español"
				],
				default: "english",
				when: (ans) => { return !answers["_lang"] },
			},
			{
				name : "--folder",
				message: (ans) => { return lang[ans["_lang"]].questions.folder },
				type : "input",
				default : () => {
					let customFolder = configFile.folders ? configFile.folders.models : null;
					return customFolder || config.folders.models
				},
				when: (ans) => { return answers["_type"] == "model" },
			},
			{
				name : "--how-import",
				message: (ans) => { return lang[ans["_lang"]].questions.howImport },
				type : "list",
				choices: [
					{
						name : `import { Model } from '@moccacoders/obremap' | export default class ${answers["--name"] || "Test"} extends Model { }`,
						value : "import"
					},
					{
						name : `const Model = require("@moccacoders/node-obremap").Model | module.exports = class ${answers["--name"] || "Test"} extends Model { }`,
						value : "require"
					}
				],
				default: "import",
				when: (ans) => { return answers["_type"] == "model" },
			}
		],
		model : [
			{
				name : "--driver",
				message: (ans) => { return lang[ans["_lang"]].questions.driver },
				type : "list",
				choices: config.drivers,
				default: config.default.driver
			},{
				name : "--snake-case",
				message: (ans) => { return lang[ans["_lang"]].questions.snakeCase },
				type : "list",
				choices: [
					"snake_case",
					"CamelCase"
				],
				default: "snake_case"
			},
			{
				name : "--name",
				message: (ans) => { return lang[ans["_lang"]].questions.name },
				type : "input",
				default: utils.toCase(answers["--name"] || "default", false, true),
				filter: (input) => { return utils.toCase(input || "", false, true) }
			},
			{
				name : "--table-name",
				message: (ans) => { return lang[ans["_lang"]].questions.tableName },
				type : "input",
				default: (ans) => {
					return utils.toCase(pluralize(ans["--name"] || "default"), true)
				}
			},
			{
				name : "--primary-key",
				message: (ans) => { return lang[ans["_lang"]].questions.primaryKey },
				type : "input",
				default: (ans) => {
					return config.default[ans["--driver"]].primaryKey;
				}
			},
			{
				name : "--incrementing",
				message: (ans) => { return lang[ans["_lang"]].questions.incrementing },
				type : "confirm",
				default: (ans) => {
					return config.default[ans["--driver"]].incrementing;
				}
			},
			{
				name : "--key-type",
				message: (ans) => { return lang[ans["_lang"]].questions.keyType },
				type : "list",
				choices: (ans) => {
					return config.choices[ans["--driver"]].keyType
				},
				default: (ans) => {
					return config.default[ans["--driver"]].keyType;
				}
			},
			{
				name : "--timestamps",
				message: (ans) => { return lang[ans["_lang"]].questions.timestamps },
				type : "confirm",
				default: (ans) => {
					return config.default[ans["--driver"]].timestamps;
				}
			},
			{
				name : "--date-format",
				message: (ans) => { return lang[ans["_lang"]].questions.dateFormat },
				type : "input",
				when: (ans) => { return ans["--timestamps"] == true },
				default: (ans) => {
					return config.default[ans["--driver"]].dateFormat;
				}
			},
			{
				name : "--created-at",
				message: (ans) => { return lang[ans["_lang"]].questions.createdAt },
				type : "input",
				when: (ans) => { return ans["--timestamps"] == true },
				default: (ans) => {
					return config.default[ans["--driver"]].createdAt;
				}
			},
			{
				name : "--updated-at",
				message: (ans) => { return lang[ans["_lang"]].questions.updatedAt },
				type : "input",
				when: (ans) => { return ans["--timestamps"] == true },
				default: (ans) => {
					return config.default[ans["--driver"]].updatedAt;
				}
			},
			{
				name : "--connection",
				message: (ans) => { return lang[ans["_lang"]].questions.connection },
				type : "input",
				default: (ans) => {
					return config.default[ans["--driver"]].connection;
				}
			}
		],
		configConnection : [
			{
				name : "__set-connection",
				message: (ans) => {
					if(answers["--connection"])
						return lang[ans["_lang"] || answers["_lang"]].questions.setConnection.replace("#_CONNECTION_#", answers["--connection"])
					else
						return lang[ans["_lang"] || answers["_lang"]].questions.setDefaultConnection
				},
				type : "confirm",
				default: config.default.connection.setConnection,
			},
			{
				name : "--config-file",
				message: (ans) => { return lang[ans["_lang"] || answers["_lang"]].questions.configFile },
				type : "confirm",
				default: config.default.connection.configFile,
				when : (ans) => {
					let configFile;
					try{
						configFile = fs.readFileSync(configPath);
						ans["--config-file"] = true;
					}catch(e){ configFile = null; }

					return ans["__set-connection"] && !configFile;
				}
			},
			{
				name : "__multi-connections",
				message: (ans) => { return lang[ans["_lang"] || answers["_lang"]].questions.multiConnections },
				type : "confirm",
				default: config.default.connection.multiConnections,
				when : (ans) => {
					return ans["__set-connection"];
				}
			}
		],
		connection : [
			{
				name : "__url-config",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.urlConfig}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "confirm",
				default: config.default.connection.urlConfig,
				when : (ans) => {
					return answers["__set-connection"];
				}
			},
			{
				name : "__url",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.url}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "confirm",
				default: config.default.connection.url,
				when : (ans) => {
					return answers["__set-connection"] && ans["__url-config"];
				}
			},
			{
				name : "--connection-url",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.connectionUrl}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				validate : (input) => {
					return utils.regex.url.test(input) || lang[answers["_lang"]].error.url;
				},
				when : (ans) => {
					return answers["__set-connection"] && ans["__url"];
				}
			},
			{
				name : "--driver",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.driver}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "list",
				choices: config.drivers,
				default: config.default.driver,
				when : (ans) => {
					if(ans["--connection-url"]){
						let url = new URL(ans["--connection-url"]);
						ans["--driver"] = url.protocol.replace(":", "");
					}
					return !answers["--driver"] && !ans["--connection-url"] && answers["__set-connection"]
				}
			},
			{
				name : "--hostname",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.hostname}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				default: config.default.connection.hostname,
				when : (ans) => {
					return answers["__set-connection"] && !ans["__url"];
				}
			},
			{
				name : "--username",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.username}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				default: config.default.connection.username,
				when : (ans) => {
					return answers["__set-connection"] && !ans["__url"];
				}
			},
			{
				name : "--password",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.password}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				default: config.default.connection.password,
				when : (ans) => {
					return answers["__set-connection"] && !ans["__url"];
				}
			},
			{
				name : "--database",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.database}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				default: config.default.connection.database,
				when : (ans) => {
					return answers["__set-connection"] && !ans["__url"];
				}
			},
			{
				name : "--port",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.port}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				default: ans => { return config.default[ans["--driver"] || answers["--driver"]].port },
				when : (ans) => {
					return answers["__set-connection"] && !ans["__url"];
				}
			},
			{
				name : "--connection-name",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.connectionName}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "input",
				default: ans => { return answers["--connection"] || config.default.connection.connectionName; },
				validate: (input) => {
					let file = null;
					if(answers["connections"] && answers["connections"].findByValue("--connection-name", input))
						return lang[answers["_lang"]].error.connectionName.replace("#_CONNECTION_NAME_#", input);

					try{
						file = fs.readFileSync(configPath);
						if(config.databases[input]) return lang[answers["_lang"]].error.connectionName.replace("#_CONNECTION_NAME_#", input);
					}catch(e){ }

					return true;
				},
				when : (ans) => {
					return answers["__set-connection"];
				}
			},
			{
				name : "__moreConnections",
				message: (ans) => { return `${lang[ans["_lang"] || answers["_lang"]].questions.moreConnections}${(answers["connections"] && answers["connections"].length > 0) ? ` (${answers["connections"].length + 1})` : ""}` },
				type : "confirm",
				default: config.default.connection.moreConnections,
				when : (ans) => {
					return answers["__set-connection"] && answers["__multi-connections"];
				}
			},
		],
		migrations : [
			{
				name : "--force",
				message: (ans) => { return lang[ans["_lang"]??"english"].questions.forceFresh },
				type : "confirm",
				default: args => { return args["--force"] }
			},
		]
	}
}

require("../prototypes.config.js");