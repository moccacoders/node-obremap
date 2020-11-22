const chalk = require("chalk");
const moment = require("moment");
const path = require("path");

const config = require("../../config");
const { getTableName } = require('../../global/get-name');
const model = require('./model');
const utils = require("../../config/utils");
const Seeder = require("./seeder")

module.exports = ({ args, cwd, fs, obremapConfig }) => {
	let name = args["--name"];
	let type = "";
	let fields = [];
	let column, from, to, match, tableName = null;
	if(!args["--folder"]) args["--folder"] = obremapConfig && obremapConfig.folders ? obremapConfig.folders.migrations : config.folders.migrations;
	if(!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
	let folderPath = path.join(cwd, args["--folder"]);
	try {
		let access = fs.accessSync(folderPath, fs.F_OK)
	} catch (e) {
		fs.mkdirSync(folderPath, { recursive : true })
	}

	let fileName = name;
	name = name.split("_");
	if(["create", "add", "rename"].includes(name[0])){
		if(name[0] == "create"){
			type = "create"
		}
		if(name[0] == "add"){
			type = "add"
		}

		if(name[0] == "rename"){
			type = "rename"
		}

		delete name[0];
	}

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
						let val;
						if(modifier.search(/^(.+)-(.+)/) >= 0)
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

	// create_[tableName]_table
	// add_[column]_to_[tableName]_table
	// rename_[column]_to_[columnTo]_on_[tableName]_table
	// rename_[tableName]_to_[tableNameTo]_table

	if(name[name.length - 1] == "table"){
		if(type == "rename"){
			if(name.includes("on")) type += "-column";
			else type += "-table";
		}
		delete name[name.length - 1];
	}

	name = name.filter(e=>e).join("_");
	if(name.search(/_to_/) >= 0){
		[match, from, to] = name.match(/(.+)_to_(.+)/);
		if(to.search(/_on_/) >= 0){
			[match, tableName] = to.match(/_on_(.+)/);
			to = to.replace(/_on_(.+)/, "")
		}

		if(type == "add"){
			column = from;
			name = to;
		}
		if(tableName)
			name = tableName;
	}
	
	const moduleName = process.env.NODE_ENV == "test" ? "../dist" : "@moccacoders/node-obremap";
	tableName = args["--table-name"] || getTableName(name);
	const template = `${args["--how-import"] == "import" ? `import { Schema } from '${moduleName}'` : `const Schema = require("${moduleName}").Schema`};
/*
	Model Name: \`${utils.toCase(fileName, false, true)}\`
	Database Table: \`${tableName}\`${
	column ? `
	Column Name: \`${column}\`` : ""}
*/
${args["--how-import"] == "import" ? 'export default' : 'module.exports ='} class ${utils.toCase(fileName, false, true)} {
	/**
	 * Run the migrations.
	 * @return void
	 */
	up() {
		${processUp({type, tableName, column, from, to, fields})}
	}

	/**
	 * Reverse the migrations.
	 * @return void
	 */
	down() {
		${processDown({type, tableName, column, from, to, fields})}
	}
}`

	let filePath = path.join(folderPath, `/${moment().format("YYYY_MM_DD_HHmmss")}_${utils.toCase(fileName)}.migration.js`);
	fs.writeFile(filePath, template, err => {
		if (err) throw err;
		console.log(chalk.green('Created Migration: '), filePath)
		if(args["--seeder"]){
			delete args["--folder"]
			Seeder({ args, cwd, fs, obremapConfig })
		}
	})

	if(args["--model"] === true) {
		model({ args, cwd, fs })
	}
}

const processUp = ({type, tableName, column, from, to, fields}) => {
	let template = `//`;
	switch(type){
		case "create":
		template = `Schema.create('${tableName}', table => {${
			fields.length > 0 ? `${processFields(fields)}
		` : `
			table.id();
			table.string('name');
			table.timestamps();
		`}})`;
		break;

		case "add":
		template = `Schema.table('${tableName}', table => {
			table.string('${column}');
		})`;
		break;

		case "rename-table":
		template = `Schema.rename('${from}', '${to}')`;
		break;

		case "rename-column":
		template = `Schema.table('${tableName}', table => {
			table.renameColumn('${from}', '${to}');
		})`;
		break;
	}
	return template;
}

const processDown = ({type, tableName, column, from, to, fields}) => {
	let template = `//`;
	switch(type){
		case "create":
		template = `Schema.dropIfExists('${tableName}')`;
		break;

		case "add":
		template = `Schema.table('${tableName}', table => {
			table.dropColumn('${column}');
		})`;
		break;

		case "rename-table":
		template = `Schema.rename('${to}', '${from}')`;
		break;

		case "rename-column":
		template = `Schema.table('${tableName}', table => {
			table.renameColumn('${to}', '${from}');
		})`;
		break;
	}
		
	return template;
}

const processFields = (fields) => {
	let str = ``;
	fields.map(field => {
		let { type, name, modifiers, ...opts } = field;
		str += `
			table.${type}(${name ? `'${name}'` : ""}${Object.entries(opts).length > 0 ? Object.entries(opts).map((opt, ind) => { return `${ind==0 ? ", " : ""}${!isNaN(opt[1]) ? opt[1] : `'${opt[1]}'`}` }).join(", ") : ""})${modifiers ? modifiers.map((mod, ind) => { return `${ind==0 ? "." : ""}${mod.name}(${mod.value ? `${!isNaN(mod.value) || mod.value == 'true' || mod.value == 'false' ? mod.value : `'${mod.value}'`}` : ""})` }).join(".") : ""};`;
	})
	return str;
}