const { getTableName } = require('../../global/get-name');
const model = require("../models/make.js");
const moment = require("moment");
const chalk = require("chalk");
const path = require("path");
const root = require("app-root-path");
const obremapConfig = require(path.join(root.path, "/obremap.config.js"));
const utils = require("../../config/utils");

module.exports = ({ args, cwd, fs }) => {
	let path = `${cwd}${args["--folder"]}`;
	let name = args["--name"];

	// check if migrations folder exists
	if(!args["--folder"]) args["--folder"] = obremapConfig.folders ? obremapConfig.folders.models : config.folders.models;
	if(!/^\//.test(args["--folder"])) args["--folder"] = `/${args["--folder"]}`;
	try {
		fs.accessSync(`${cwd}${args["--folder"]}`, fs.F_OK)
	} catch (e) {
		fs.mkdirSync(`${cwd}${args["--folder"]}`, { recursive : true })
	}

	const template = `import { Schema } from '@moccacoders/node-obremap'
/*
	Model Name: ${name}
	Database Table: ${getTableName(name)}
*/
export default class ${name}Migration {
	up() {
		Schema.create('${args["--table-name"] || getTableName(name)}', table => {
			// table.increments('id')
			// table.string('name')
			// table.timestamps()
		})
	}
	down() {
		Schema.drop(${getTableName(name)})
	}
}`

	let filePath = `${cwd}${args["--folder"]}/${utils.toCase(args["--name"])}.migration.js`;
	fs.writeFile(filePath, template, err => {
		if (err) throw err;
	})

	console.log(
		`\n  >    `, chalk.green('Created Migration: '), filePath
	)

	if(args["--model"] === true) {
		model({ args, cwd, fs })
	}
}