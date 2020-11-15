const chalk = require("chalk");
const moment = require("moment");
const path = require("path");
const root = require("app-root-path");

const config = require("../../config");
const { getTableName } = require('../../global/get-name');
const model = require('./model');
const obremapConfig = require(path.join(root.path, "/obremap.config.js"));
const utils = require("../../config/utils");

module.exports = ({ args, cwd, fs }) => {
	let name = args["--name"];
	let type = "";
	let column, from, to, match, tableName = null;
	if(!args["--folder"]) args["--folder"] = obremapConfig.folders ? obremapConfig.folders.migrations : config.folders.migrations;
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
		${processUp({type, tableName, column, from, to})}
	}

	/**
	 * Reverse the migrations.
	 * @return void
	 */
	down() {
		${processDown({type, tableName, column, from, to})}
	}
}`

	let filePath = path.join(folderPath, `/${moment().format("YYYY_MM_DD_HHmmss")}_${utils.toCase(fileName)}.migration.js`);
	fs.writeFile(filePath, template, err => {
		if (err) throw err;
		console.log(chalk.green('Created Migration: '), filePath)
	})

	if(args["--model"] === true) {
		model({ args, cwd, fs })
	}
}

const processUp = ({type, tableName, column, from, to}) => {
	let template = `//`;
	switch(type){
		case "create":
		template = `Schema.create('${tableName}', table => {
			table.id();
			table.string('name');
			table.timestamps();
		})`;
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

const processDown = ({type, tableName, column, from, to}) => {
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