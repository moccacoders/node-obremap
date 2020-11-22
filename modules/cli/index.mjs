#! /usr/bin/env node
import fs from 'fs'
import yargs from "yargs";
import chalk from "chalk";
import path from "path";
import { toCase, regex } from "../config/utils";
import "core-js/stable";
import "regenerator-runtime/runtime";

const argsToOptions = yargs
.scriptName("obremap")
.usage("Usage: $0 <cmd> [args]")
.command('make:model <name>', 'Create a new Obremap Model Class', yargs => {
	yargs
	.usage("Usage: $0 make:model <name> [args]")
	.positional("name", {
		describe: "Defines the name of the Obremap Model Class to create.",
		type: "string"
	})
	.option({
		"a" : {
			alias : "incrementing",
			type : "boolean",
			describe : "Set this option if your primary key field is auto incrementing."
		},
		"c" : {
			alias : "snake-case",
			type : "boolean",
			describe : "Set this option to use Snake Case mode (test_name). Default: Camel Case (CamelCase)",
		},
		"d" : {
			alias : "driver",
			choices: ['mysql'],
			describe : "Select the driver you want to use.",
			default: "mysql"
		},
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"i" : {
			alias : "created-at-name",
			type : "string",
			describe : "Defines the custom name of the 'created-at' field."
		},
		"k" : {
			alias : "key-type",
			type : "string",
			describe : "Defines the primary key field type."
		},
		"n" : {
			alias : "connection",
			type : "string",
			describe : "Defines the custom connection name."
		},
		"p" : {
			alias : "primary-key",
			type : "string",
			describe : "Defines the custom primary key field name.",
		},
		"s" : {
			alias : "timestamps",
			type : "boolean",
			describe : "Set this option if you want to add created and updated dates."
		},
		"t" : {
			alias : "table-name",
			type : "string",
			describe : "Defines the custom table name."
		},
		"u" : {
			alias : "updated-at-name",
			type : "string",
			describe : "Defines the custom name of the 'updated-at' field."
		},
		"w" : {
			alias : "wizard",
			type : "boolean",
			describe : "Set this option if you want to use the Obremap Model Class Creation Wizard."
		},
		"x" : {
			alias : "date-format",
			type : "string",
			describe : "Define the format of your dates. See: https://momentjs.com/docs/#/displaying/format/."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		}
	})
	.version(false)
	.help("h")
	.example('$0 make:model <name>', '"Simple way to create an Obremap Model Class"')
	.example('$0 make:model <name> -w', '"Create a model with the Obremap Model Class Creation Wizard."')
})
.command('make:connection <connection-name>', 'Create a new Database Connection', yargs => {
	yargs
	.positional("connection-name", {
		describe: "Defines the name of the Obremap Model Class to create.",
		type: "string",
		default : "default"
	})
	.option({
		"f" : {
			alias : "config-file",
			describe : "Set this option to use the Obremap Config File (Recommended)",
			type : "boolean",
			default : true
		},
		"x" : {
			alias : "connection-url",
			describe : "Define you connection url (mysql://user:pass@hostname:port/database)",
			type : "string"
		},
		"d" : {
			alias : "driver",
			choices: ['mysql'],
			describe : "Select the driver you want to use.",
			default: "mysql"
		},
		"i" : {
			alias : "hostname",
			describe: "",
			type: "string"
		},
		"u" : {
			alias : "username",
			describe: "",
			type: "string"
		},
		"p" : {
			alias : "password",
			describe: "",
			type: "string"
		},
		"s" : {
			alias : "database",
			describe: "",
			type: "string"
		},
		"t" : {
			alias : "port",
			describe: "",
			type: "string"
		},
		"w" : {
			alias : "wizard",
			type : "boolean",
			describe : "Set this option if you want to use the Obremap Model Class Creation Wizard."
		}
	})
	.help("h")
	.version(false)
	.check((args, opt) => {
		if (args["connection-url"] && regex.url.test(args["connection-url"]) || (args["driver"] && args["hostname"] && args["username"] && args["password"] && args["database"]) || args["wizard"])
			return true
		throw new Error("A connection url or database info is required.");
	})
})
.command('make:migration <name> [options]', 'Create a new migration file', yargs => {
	yargs
	.positional("name", {
		describe: "Defines the name of the Obremap Migration.",
		type: "string"
	})
	.option({
		"t" : {
			alias : "table-name",
			type : "string",
			describe : "Defines the table name."
		},
		"m" : {
			alias : "model",
			type : "boolean",
			describe : "Set this option if you want to create an Obremap Model Class."
		},
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"fields" : {
			type: "array",
			describe : "Defines the migrations fields."
		},
		"s" : {
			alias : "seeder",
			type : "boolean",
			describe : "Set this option if you want to create a Seeder Class."
		}
	})
	.version(false)
	.help("h")
})
.command('make:seeder <name> [options]', 'Create a new migration file', yargs => {
	yargs
	.positional("name", {
		describe: "Defines the name of the Obremap Migration.",
		type: "string"
	})
	.option({
		"t" : {
			alias : "table-name",
			type : "string",
			describe : "Defines the table name."
		},
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		}
	})
	.version(false)
	.help("h")
})
.command('migrate', 'Execute all migrations', yargs => {
	yargs
	.option({
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		},
		"p" : {
			alias : "path",
			type : "array",
			describe : "The path(s) to the migrations files to be executed."
		},
		"pretend" : {
			type: "boolean",
			describe: "Dump the SQL queries that would be run."
		}
	})
	.version(false)
	.help("h")
})
.command('migrate:reset', 'Rollback all database migrations', yargs => {
	yargs
	.option({
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		}
	})
	.version(false)
	.help("h")
})
.command('migrate:refresh', 'Reset and re-run all migrations', yargs => {
	yargs
	.option({
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		}
	})
	.version(false)
	.help("h")
})
.command('migrate:rollback', 'Rollback the last database migration', yargs => {
	yargs
	.option({
		"s": {
			alias : "step",
			type : "number",
			describe : "The number of migrations to be reverted"
		},
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		}
	})
	.version(false)
	.help("h")
})
.command('migrate:fresh', 'Drop all tables and re-run all migrations', yargs => {
	let demand = (process.env.NODE_ENV == "production") ? ["f", "force"] : []
	yargs
	.option({
		"f" : {
			alias : "force",
			type : "boolean",
			describe: "Force the operation to run when in production"
		},
		"p" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"s" : {
			alias : "seed",
			type : "boolean",
			describe : "Indicates if the seed task should be re-run."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		}
	})
	.version(false)
	.help("h")
})
.command('seed', 'Execute all migrations', yargs => {
	yargs
	.option({
		"f" : {
			alias : "folder",
			type : "string",
			describe : "Defines the custom folder path."
		},
		"o" : {
			alias : "how-import",
			type : "string",
			describe : "How do you want to import the 'Node OBREMAP' module?",
			choices: ['import', 'require'],
			default : "import"
		}
	})
	.version(false)
	.help("h")
})
.demandCommand(1, 'You need at least one command before moving on.')
.wrap(yargs.terminalWidth())
.alias("v", "version")
.alias("h", "help")
.option({
	"verbose" : {
		type : "boolean",
		default : false,
		describe : "Set this to get complete error trace"
	}
})
.example('$0 make:model User', '-  Use custom config')
.strict()
.argv

const start = async (args) => {
	let newArgs = {};
	let obremapConfig = null;
	let cwd = process.cwd();
	try{
		obremapConfig = require(path.join(cwd, "/obremap.config.js"));
	}catch(err){}

	Object.entries(args).map(obj => {
		if(obj[0].length > 2)
			newArgs[`--${toCase(obj[0], true).replace("_", "-")}`] = obj[1];
	});
	global.dev = newArgs["--verbose"];
	const [cmd, type] = args._[0].split(":");
	newArgs["_type"] = type;
	let command = await import(`./${cmd}/${type || "index.js"}`)
	let options = ({
		args: newArgs,
		cwd,
		fs,
		obremapConfig
	})
	
	if(command.default) command = command.default
	if(command.default) command = command.default

	try {
		command(options)
	} catch (err) {
		console.log(chalk.red("Error:"), err.message);
		if(global.dev)
			console.log(err);
	}
}

start(argsToOptions);