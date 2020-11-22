const chalk = require("chalk");
const path = require("path");

const config = require("../../config");
const { getTableName } = require('../../global/get-name');
const model = require("./model");
const utils = require("../../config/utils");
const moduleName = process.env.NODE_ENV == "test" ? "../dist" : "@moccacoders/node-obremap";

module.exports = ({ args, cwd, fs, obremapConfig }) => {
	let name = args["--name"].replace(/_?(table|create|add|rename-table|rename-column)_?/g, "");
	let up = "";
	let fields = [];
	let down = "";
	let column = "";
	if(!args["--folder"]) args["--folder"] = obremapConfig && obremapConfig.folders ? obremapConfig.folders.seeders : config.folders.seeders;
	if(!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
	let folderPath = path.join(cwd, args["--folder"]);
	const fileName = utils.toCase(name.replace(/(_|\-|\.)?seeder/i, ""));
	const filePath = path.join(folderPath, `/${fileName}.seeder.js`);

	if(args["--fields"] && args["--fields"].length > 0){
		args["--fields"].map(field => {
			let options = field.split(",");
			let opts = 1;
			field = {};
			
			let names = ["type", "name"];
			Object.entries(options).map(obj => {
				let [ind, value] = obj;
				let modifiers;
				let modLen = !field["modifiers"] ? 0 : field["modifiers"].length;
				let name = names[ind] ? names[ind] : `opt${opts}`;
				if(value.search(/\./) >= 0){
					[value, ...modifiers] = value.split(/\./)
					modifiers.map(modifier => {
						let val, match;
						if(modifier.search(/(.+)-(.+)/) >= 0)
							[match, modifier, val] = modifier.match(/(.+)-(.+)/);

						if(!field["modifiers"]) field["modifiers"] = [];
						if(!field["modifiers"][modLen]) field["modifiers"][modLen] = {};
						field["modifiers"][modLen]["name"] = modifier;
						if(val) field["modifiers"][modLen]["value"] = val;
						modLen++;
					})
				}
				field[name] = value;
				if(field[`opt${opts}`]) opts++;
			});
			fields.push(field)
		})
	}

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
			DB.table('${tableName}').timestamps(${fields.filter(field => field.type.search("timestamp") >= 0).length > 0}).set([
				{${ 
					fields ? processFields(fields) : `
					name : 'John',
					last_name : 'Doe',
					email : 'john.doe@example.com'`}
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

const processFields = (fields) => {
	let str = ``;
	fields.map(field => {
		let { type, name, modifiers, ...opts } = field;
		if(name)
		str += `
					${name} : ${type.search(/(id|int)/) >= 0 ? 0 : `''`}`;
	})
	return str;
}