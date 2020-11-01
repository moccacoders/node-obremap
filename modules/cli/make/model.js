const config = require("../../config");
const inquirer = require("inquirer");
const path = require("path");
const pluralize = require("pluralize");
const questions = require("../../config/cli/questions.cli");
const root = require("app-root-path");
const utils = require("../../config/utils");
const lang = require('../../config/languages');
const connection = require('../make/connection');
let obremapConfig = {};

try{
	obremapConfig = require(path.join(root.path, "/obremap.config.js"));
}catch(err){ console.log(err) }

module.exports = ({ args, cwd, fs }) => {
	configuration(args).then(answers => {
		args = answers

		let modelName = utils.toCase(args["--name"], false, true);

		let options = "";
		Object.entries(args).map((arg, ind) => {
			let [key, val] = arg;
			if(/^_(.+)?/.test(key) || ["--name", "--driver", "--how-import", "--wizard", "--folder"].includes(key)) return true;
			key = utils.toCase(key.replace("--", "").replace("-", "_"), false);
			if(val == config.default[args["--driver"]][key] || val == utils.toCase(pluralize(args["--name"] || "default"), args["--snake-case"])) return true;
			options += `static ${key} = ${typeof val == "string" ? `'${val}'` : val};
	`;
		});

		const template = `${args["--how-import"] == "import" ? `import { Model } from '@moccacoders/obremap'` : `const Model = require("@moccacoders/node-obremap").Model`};
${args["--how-import"] == "import" ? 'export default' : 'module.exports ='} class ${modelName} extends Model {
	${options}${args["--table-name"] ? "" : `
	/*
		overwrite table name, this action is optional
		static tableName = "table_name";
	*/
	`}
}
`;
		/*
		check if models folder exists
		*/
		if(!args["--folder"]) args["--folder"] = obremapConfig.folders ? obremapConfig.folders.models : config.folders.models;
		if(!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
		try {
			fs.accessSync(`${cwd}${args["--folder"]}`, fs.F_OK)
		} catch (e) {
			fs.mkdirSync(`${cwd}${args["--folder"]}`, { recursive : true })
		}

		let filePath = `${cwd}${args["--folder"]}/${utils.toCase(args["--name"])}.model.js`;
		fs.writeFile(filePath, template, err => {
			if (err) throw err;
			console.log(`\n  >    `, lang[answers["_lang"] || "english"].model.created, filePath, "\n")
		})

	});
}

const configuration = (args) => {
	return new Promise((done, error) => {
		if(!args["--wizard"]) return done(args);
		let answers = {...args};
		let errorConnection = false;
		inquirer.prompt([...questions(answers).general, ...questions(answers).model])
		.then(ans => {
			if(ans["--snake-case"]) ans["--snake-case"] = ans["--snake-case"] == "snake_case" ? true : false;
			if(ans["--name"]) ans["--name"] = utils.toCase(ans["--name"], false, true);
			if(ans["--table-name"]) ans["--table-name"] = utils.toCase(ans["--table-name"], answers["--snake-case"]);
			if(ans["--connection"] != "default") {
				if(!process.env[`DB_${ans["--connection"].toUpperCase()}_HOST`] && !process.env[`DB_${ans["--connection"].toUpperCase()}_URL`] )
					errorConnection = true;
				else errorConnection = false

				try{
					if(!obremapConfig.databases[ans["--connection"]])
						errorConnection = true;
					else errorConnection = false
				}catch(err){
					errorConnection = true;
				}
			}

			answers = {
				...answers,
				...ans
			}
			if(errorConnection){
				answers["_createConnection"] = true;
				connection({args: answers}).then(answers => {
					done(answers);
				});
			}
			else
				done(answers);
		}).catch(err => console.log(err))
	});
}