const fs = require("fs");
const inquirer = require("inquirer");
const lang = require('../../config/languages');
const path = require("path");
const questions = require("../../config/cli/questions.cli");
c 
module.exports = ({ args, cwd, fs }) => {
	let answers;
	if(!args["--wizard"]){
		delete args["_type"];
		delete args["--config-file"];
		args = {
			"__set-connection" : true,
			"--config-file" : true,
			connections : [args]
		};
		return setConnetion(args, cwd);
	}
	if(!args["_createConnection"])
		connectionConfig(args)
		.then(ans => {
			answers = ans;
			setConnetion(answers, cwd)
		});

	else
		return new Promise(done => {
			connectionConfig(args)
			.then(ans => {
				answers = ans;
				if(setConnetion(answers, cwd)){
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

const setConnetion = (args, cwd) => {
	if(!args["__set-connection"] || !args["connections"]) return true;
	if(!args["--config-file"]){
		console.log(`\n------------------------------------------------------------------------\n\n${lang[args["_lang"]].connectionEnv}\n${lang[args["_lang"]].connectionEnvMsg}\n\n------------------------------------------------------------------------\n`);

		args["connections"].map(connection => {
			let dbName = connection["--connection-name"] != "default" ? `_${connection["--connection-name"].toUpperCase()}` : "";
			console.log(`${
(connection["__url-config"]) ?
`DB${dbName}_URL="${
	connection["__url"] ? `${connection["--connection-url"]}` : 
	`${connection["--driver"]}://${connection["--username"]}:${connection["--password"]}@${connection["--hostname"]}${connection["--port"] ? `:${connection["--port"]}` : ``}/${connection["--database"]}`
}"` : 
`DB${dbName}_DRIVER="${connection["--driver"]}"
DB${dbName}_HOST="${connection["--hostname"]}"
DB${dbName}_USER="${connection["--username"]}"
DB${dbName}_PASSWORD="${connection["--passwor"]}"
DB${dbName}_DATABSE="${connection["--database"]}"
DB${dbName}_PORT="${connection["--port"]}"`
}`);
		});

console.log(`\n------------------------------------------------------------------------\n`);
		return true;
	}

	const configPath = path.join(cwd, "/obremap.config.js");
	let config = {databases:{}};
	let configFile = null;
	try{ config = require(configPath) }
	catch(err){ }

	let databases = config && config.databases ? config.databases : {};

	args["connections"].map(connection => {
		if(connection["__url-config"] && !connection["__url"])
			connection["--connection-url"] = `${connection["--driver"]}://${connection["--username"]}:${connection["--password"]}@${connection["--hostname"]}${connection["--port"] ? `:${connection["--port"]}` : ``}/${connection["--database"]}`;

		console.log(connection["--connection-name"]);
		databases[connection["--connection-name"]] = (connection["--connection-url"]) ? connection["--connection-url"] : {
			driver : connection["--driver"],
			host : connection["--hostname"],
			user : connection["--username"],
			password : connection["--password"],
			database : connection["--database"],
			port : connection["--port"]
		}
	});

	if(config.empty)
		config = {
			databases
		};

	try { configFile = fs.readFileSync(configPath, "utf8") }
	catch(err) { }

	if(configFile){
		const regex = /^module.exports ?= ?(\s)?{((.|\s)*?)?}(\s)?}?(\s)?}?(\s)?}?(?!(\ ))$/gm;
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
		console.log(`\n  >    `, lang[args["_lang"] || "english"].configFile[configFile ? "updated" : "created"], configPath);
	}catch(err) { console.log(err) }
	return true;
}