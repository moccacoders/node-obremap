const fs = require("fs");
const inquirer = require("inquirer");
const lang = require('../../config/languages');
const path = require("path");
const questions = require("../../config/cli/questions.cli");
const root = require("app-root-path");

module.exports = ({ args, cwd, fs }) => {
	let answers;
	if(!args["_createConnection"])
		connectionConfig(args)
		.then(ans => {
			answers = ans;
			setConnetion(answers)
		});

	else
		return new Promise(done => {
			connectionConfig(args)
			.then(ans => {
				answers = ans;
				if(setConnetion(answers)){
					done(answers);
				}
			});
		})

}

const connectionConfig = (args) => {
	return new Promise((done, error) => {
		let answers = {...args};
		if(args["_createConnection"]) console.log(`\n------------------------------------------------------------------------\n${lang[answers["_lang"]].connectionConfig}\n------------------------------------------------------------------------\n`);
		inquirer.prompt([...questions(answers).general, ...questions(answers).configConnection])
		.then(ans => {
			if(ans["__url-config"] && !ans["__url"]) console.log(`\n------------------------------------------------------------------------\n${lang[answers["_lang"]].wizard}\n------------------------------------------------------------------------\n`);
			answers = {
				...answers,
				...ans
			}

			createConnection(answers).then((ans) => {
				done(ans);
			})
		})
	});
}

const createConnection = (answers) => {
	return new Promise((done, error) => {
		inquirer.prompt(questions(answers).connection)
		.then(connection => {
			answers = {
				...answers
			}

			if(!answers["connections"]) answers["connections"] = [];
			answers["connections"].push(connection);

			if(connection["__moreConnections"] === true){
				createConnection(answers).then(ans => {
					done(ans)
				});
			} else{
				done(answers);
			}
		})
	})
}

const setConnetion = (args) => {
	if(!args["__set-connection"] || !args["connections"]) return true;
	if(!args["__config-file"]){
		console.log(`\n------------------------------------------------------------------------\n\n${lang[args["_lang"]].connectionEnv}\n${lang[args["_lang"]].connectionEnvMsg}\n\n------------------------------------------------------------------------\n`);

		args["connections"].map(connection => {
			let dbName = connection["__connectionName"] != "default" ? `_${connection["__connectionName"].toUpperCase()}` : "";
			console.log(`${
(connection["__url-config"]) ?
`DB${dbName}_URL="${
	connection["__url"] ? `${connection["___connection-url"]}` : 
	`${connection["--driver"]}://${connection["___username"]}:${connection["___password"]}@${connection["___hostname"]}${connection["___port"] ? `:${connection["___port"]}` : ``}/${connection["___database"]}`
}"` : 
`DB${dbName}_DRIVER="${connection["--driver"]}"
DB${dbName}_HOST="${connection["___hostname"]}"
DB${dbName}_USER="${connection["___username"]}"
DB${dbName}_PASSWORD="${connection["___passwor"]}"
DB${dbName}_DATABSE="${connection["___database"]}"
DB${dbName}_PORT="${connection["___port"]}"`
}`);
		});

console.log(`\n------------------------------------------------------------------------\n`);
		return true;
	}

	const configPath = path.join(root.path, "/obremap.config.js");
	let config = {databases:{}};
	let configFile = null;
	try{ config = require(configPath) }
	catch(err){ }

	let databases = config && config.databases ? config.databases : {};

	args["connections"].map(connection => {
		if(connection["__url-config"] && !connection["__url"])
			connection["___connection-url"] = `${connection["--driver"]}://${connection["___username"]}:${connection["___password"]}@${connection["___hostname"]}${connection["___port"] ? `:${connection["___port"]}` : ``}/${connection["___database"]}`;

		databases[connection["__connectionName"]] = (connection["___connection-url"]) ? connection["___connection-url"] : {
			driver : connection["--driver"],
			host : connection["___hostname"],
			user : connection["___username"],
			password : connection["___password"],
			database : connection["___database"],
			port : connection["___port"]
		}
	});

	if(config.empty)
		config = {
			databases
		};

	try { configFile = fs.readFileSync(configPath, "utf8") }
	catch(err) { }

	if(configFile){
		const regex = /^module.exports ?= ?(\s)?{((.|\s)*?)?}(\s)?}?(?!(\ ))$/gm;
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
	}catch(err) { }
	return true;
}