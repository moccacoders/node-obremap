const chalk = require("chalk");
const path = require("path");
const root = require("app-root-path");

const config = require("../../config");
const { getTableName } = require('../../global/get-name');
const model = require("./model");
const obremapConfig = require(path.join(root.path, "/obremap.config.js"));
const utils = require("../../config/utils");
const moduleName = process.env.NODE_ENV == "test" ? "../dist" : "@moccacoders/node-obremap";

module.exports = ({ args, cwd, fs }) => {
	let name = args["--name"];
	let up = "";
	let down = "";
	let column = "";
	if(!args["--folder"]) args["--folder"] = obremapConfig.folders ? obremapConfig.folders.seeders : config.folders.seeders;
	if(!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
	let folderPath = path.join(cwd, args["--folder"]);
	const fileName = utils.toCase(name.replace(/(_|\-|\.)?seeder/i, ""));
	const filePath = path.join(folderPath, `/${fileName}.seeder.js`);

	try {
		let file = fs.readFileSync(filePath)
		console.log(chalk.yellow("Warning."), `Seeder ('${fileName}.seeder.js') already exists.`, chalk.bold("Seeder not created."))
		return false;
	} catch (e) { }

	if(!createSeederContainer({ args, cwd, fs }))
		return false;

	const className = utils.toCase(name, false, true);
	const tableName = args["--table-name"] || getTableName(name.replace(/(_|\-|\.)?seeder/i, ""));

	const template = `${args["--how-import"] == "import" ? `import { Seeder } from '${moduleName}'` : `const Seeder = require("${moduleName}").Seeder`};
${args["--how-import"] == "import" ? `import { DB } from '${moduleName}'` : `const DB = require("${moduleName}").DB`};

${args["--how-import"] == "import" ? 'export default' : 'module.exports ='} class ${className} extends Seeder{
	/**
	 * Run seeder.
	 * @return void
	 */
	static run() {
		/*
			DB.table('${tableName}').truncate();
			DB.table('${tableName}').timestamps().set([
				{
					name : 'John',
					last_name : 'Doe',
					email : 'john.doe@example.com'
				}
			]).create();
		*/
	}
}`

	fs.writeFile(filePath, template, err => {
		if (err) throw err;
		console.log(
			chalk.green('Seeder created: '), filePath
		)
	})

	if(args["--model"] === true) {
		model({ args, cwd, fs })
	}
}

const createSeederContainer = ({ args, cwd, fs }) => {
	let folderPath = path.join(cwd, args["--folder"]);
	let containerPath = path.join(folderPath, "/container.seeder.js");
	let name = args["--name"];
	let fileName = utils.toCase(name.replace(/seeder/i, ""))
	let className = utils.toCase(name, false, true);
	let importClass = `${args["--how-import"] == "import" ? `import ${className} from './${fileName}.seeder'` : `const ${className} = require('./${fileName}.seeder')`};`
	try{
		let container = fs.readFileSync(containerPath).toString().split("\n");
		let insertInd = null;
		let insertLine = 0;
		let moduleInd = null;
		let moduleLine = 0;
		container.map((line, ind) => {
			if(line.search(moduleName) >= 0)
				insertInd = true;

			if(line.search("class SeedContainer") >= 0)
				insertInd = false;

			if(insertInd !== null && insertInd !== false){
				if(line != importClass && insertLine !== null)
					insertLine = ind;
				else insertLine = null;
			}

			if(line.search(/this.call ?\[/i) >= 0)
				moduleInd = true;

			if(line.search("]") >= 0)
				moduleInd = false;

			if(moduleInd !== null && moduleInd !== false){
				if(line.search(`/${className}\,?$/`) < 0 && moduleLine !== null)
					moduleLine = ind;
				else moduleLine = null;
			}
		})
		if(insertLine > 0 && insertLine !== null)
			container.splice(insertLine, 0, importClass)
		if(moduleLine > 0 && moduleLine !== null){
			if(container[moduleLine+1].search(/this.call/i) < 0)
				container[moduleLine+1] = `${container[moduleLine+1]},`
			container.splice(moduleLine+2, 0, `\t\t\t${className}`)
		}

		fs.writeFileSync(containerPath, container.join("\n"))
		console.log("Seeder add to Seed Container", chalk.green("succesfully"))
		return true;
	}catch(err){
		if(err.message.search("no such file or directory") >= 0){
			try{
				try {
					let access = fs.accessSync(folderPath, fs.F_OK)
				} catch (e) {
					fs.mkdirSync(folderPath, { recursive : true })
				}
				const template = `${args["--how-import"] == "import" ? `import { Seeder } from '${moduleName}'` : `const Seeder = require("${moduleName}").Seeder`};
${importClass}

${args["--how-import"] == "import" ? 'export default' : 'module.exports ='} class SeedContainer extends Seeder {
	/**
	 * Set seed container.
	 * @return void
	 */
	static run() {
		this.call([
			${className}
		])
	}
}`
				fs.writeFileSync(containerPath, template, { recursive : true })
				console.log("Seed Container created", chalk.green("successfully"))
				return true;
			}catch(err){
				console.log(chalk.yellow("Error: "), err.message)
				return false;
			}
		}
		else{
			console.log(chalk.red("Error: "), err.message)
			return false;
		}
	}
}