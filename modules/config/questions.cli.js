import pluralize from "pluralize";

import config from './index.js';
import lang from './languages/index.js';
import utils from './utils.js';

export default answers => {
	if(!answers["_lang"]) answers["_lang"] = "english";
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
				default: "english"
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
				default: utils.toCase(answers["--name"] || "default", false, true),
				filter: (input) => { return utils.toCase(input || "", false, true) }
			},
			{
				name : "--table-name",
				message: (ans) => { return lang[ans["_lang"]].questions.tableName },
				type : "input",
				default: (ans) => {
					return utils.toCase(pluralize(ans["--name"] || "default"), true)
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
				message: lang[answers["_lang"]].questions.setConnection.replace("#_CONNECTION_#", answers["--connection"]),
				type : "confirm",
				default: config.default.connection.setConnection,
			},
			{
				name : "__config-file",
				message: lang[answers["_lang"]].questions.configFile,
				type : "confirm",
				default: config.default.connection.configFile,
				when : (ans) => {
					return ans["__set-connection"];
				}
			},
			{
				name : "__multi-connections",
				message: lang[answers["_lang"]].questions.multiConnections,
				type : "confirm",
				default: config.default.connection.multiConnections,
				when : (ans) => {
					return ans["__set-connection"];
				}
			},
			{
				name : "__url-config",
				message: lang[answers["_lang"]].questions.urlConfig,
				type : "confirm",
				default: config.default.connection.urlConfig,
				when : (ans) => {
					return ans["__set-connection"];
				}
			},
			{
				name : "__url",
				message: lang[answers["_lang"]].questions.url,
				type : "confirm",
				default: config.default.connection.url,
				when : (ans) => {
					return ans["__set-connection"] && ans["__url-config"];
				}
			}
		],
		connection : [
			{
				name : "___connection-url",
				message: lang[answers["_lang"]].questions.connectionUrl,
				type : "input",
				validate : (input) => {
					return utils.regex.url.test(input) || lang[answers["_lang"]].error.url;
				},
				when : (ans) => {
					return answers["__set-connection"] && answers["__url"];
				}
			},
			{
				name : "--driver",
				message: lang[answers["_lang"]].questions.driver,
				type : "list",
				choices: config.drivers,
				default: config.default.driver,
				when : (ans) => {
					return !answers["--driver"] && answers["__set-connection"]
				}
			},
			{
				name : "___hostname",
				message: lang[answers["_lang"]].questions.hostname,
				type : "input",
				default: config.default.connection.hostname,
				when : (ans) => {
					return answers["__set-connection"] && !answers["__url"];
				}
			},
			{
				name : "___username",
				message: lang[answers["_lang"]].questions.username,
				type : "input",
				default: config.default.connection.username,
				when : (ans) => {
					return answers["__set-connection"] && !answers["__url"];
				}
			},
			{
				name : "___password",
				message: lang[answers["_lang"]].questions.password,
				type : "input",
				default: config.default.connection.password,
				when : (ans) => {
					return answers["__set-connection"] && !answers["__url"];
				}
			},
			{
				name : "___database",
				message: lang[answers["_lang"]].questions.database,
				type : "input",
				default: config.default.connection.database,
				when : (ans) => {
					return answers["__set-connection"] && !answers["__url"];
				}
			},
			{
				name : "___port",
				message: lang[answers["_lang"]].questions.port,
				type : "input",
				default: ans => { return config.default[ans["--driver"] || answers["--driver"]].port },
				when : (ans) => {
					return answers["__set-connection"] && !answers["__url"];
				}
			},
			{
				name : "__connectionName",
				message: lang[answers["_lang"]].questions.connectionName,
				type : "input",
				default: ans => { return answers["--connection"] || config.default.connection.connectionName; },
				when : (ans) => {
					return answers["__set-connection"];
				}
			},
			{
				name : "__moreConnections",
				message: lang[answers["_lang"]].questions.moreConnections,
				type : "confirm",
				default: config.default.connection.moreConnections,
				when : (ans) => {
					return answers["__set-connection"] && answers["__multi-connections"];
				}
			},
		]
	}
}