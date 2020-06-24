import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import root from "app-root-path";

import lang from '../../config/languages/index.js';
import questions from "../../config/questions.cli.js";

export default ({ args, cwd, fs }) => {
	let answers;
	return new Promise(done => {
		connectionConfig(args)
		.then(ans => {
			answers = ans;
			if(args["_createConnection"])
				if(createConnetion(answers)){
					done(answers);
				}
		});
	})

}

const connectionConfig = (args) => {
	return new Promise((done, error) => {
		let answers = {...args};
		console.log(`\n------------------------------------------------------------------------\n${lang[answers["_lang"]].connectionConfig}\n------------------------------------------------------------------------\n`);
		inquirer.prompt(questions(answers).configConnection)
		.then(ans => {
			if(ans["__url-config"] && !ans["__url"]) console.log(`\n------------------------------------------------------------------------\n${lang[answers["_lang"]].wizard}\n------------------------------------------------------------------------\n`);
			answers = {
				...answers,
				...ans
			}

			inquirer.prompt(questions(answers).connection)
			.then(ans => {
				answers = {
					...answers,
					...ans
				}

				done(answers);
			}).catch(err => console.log(err))
		}).catch(err => console.log(err))
	});
}

const createConnetion = (args) => {
	if(!args["__set-connection"]) return true;
	if(!args["__config-file"]){
		let dbName = args["__connectionName"] != "default" ? `_${args["__connectionName"].toUpperCase()}` : "";
		console.log(`\n------------------------------------------------------------------------\n\n${lang[args["_lang"]].connectionEnv}\n${lang[args["_lang"]].connectionEnvMsg}\n\n------------------------------------------------------------------------\n`);
		console.log(`${
(args["__url-config"]) ?
`DB${dbName}_URL="${
	args["__url"] ? `${args["___connection-url"]}` : 
	`${args["--driver"]}://${args["___username"]}:${args["___password"]}@${args["___hostname"]}${args["___port"] ? `:${args["___port"]}` : ``}/${args["___database"]}`
}"` : 
`DB${dbName}_DRIVER="${args["--driver"]}"
DB${dbName}_HOST="${args["___hostname"]}"
DB${dbName}_USER="${args["___username"]}"
DB${dbName}_PASSWORD="${args["___passwor"]}"
DB${dbName}_DATABSE="${args["___database"]}"
DB${dbName}_PORT="${args["___port"]}"`
}

------------------------------------------------------------------------\n`);
		return true;
	}

	const configPath = path.join(root.path, "/obremap.config.js");
	let config = {databases:{}};
	let configFile = null;
	try{ config = require(configPath) }
	catch(err){ }


	let databases = config && config.databases ? config.databases : {};
	if(args["__url-config"] && !args["__url"])
		args["___connection-url"] = `${args["--driver"]}://${args["___username"]}:${args["___password"]}@${args["___hostname"]}${args["___port"] ? `:${args["___port"]}` : ``}/${args["___database"]}`;

	databases[args["__connectionName"]] = (args["___connection-url"]) ? args["___connection-url"] : {
		driver : args["--driver"],
		host : args["___hostname"],
		user : args["___username"],
		password : args["___password"],
		database : args["___database"],
		port : args["___port"]
	}

	try { configFile = fs.readFileSync(configPath, "utf8") }
	catch(err) { console.log(err) }

	if(configFile){
		const regex = /^module.exports ?= ?(\s)?{((.|\s)*?)}(\s)?}(?!(\ ))$/gm;
		const match = configFile.match(regex);
		configFile = configFile.replace(match[0], "#_TEMPLATE_#");
	}

	let template = `module.exports = ${JSON.stringify(config, null, "\t")}`;
	if(configFile) template = configFile.replace("#_TEMPLATE_#", template)
	if(!/\/\/ THIS CONFIG FILE WAS CREATED BY OBREMAP CLI/.test(configFile))
		template = `// THIS CONFIG FILE WAS CREATED BY OBREMAP CLI
${template}
`;

	try {
		fs.writeFileSync(configPath, template, "utf8")
		console.log(`\n  >    `, lang[args["_lang"]].configFile[configFile ? "updated" : "created"], configPath);
		return true
	}catch(err) {
		console.log(err)
		return true;
	}
}