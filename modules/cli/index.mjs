#! /usr/bin/env node
import fs from 'fs'
import arg from "arg";
import model from "./models/make.js"

let commands = {
	// 'make:migration': require('./migrations/make').default,
	'make:model': model,
}

if(!commands[process.argv[2]])
	console.log(`command not found: ${process.argv[2]}`);
else{
	const argsToOptions = () => {
		const args = arg({
			// CLI BASICS
			"--help" : Boolean,
			"--version" : Boolean,
			// MODEL INFORMATION
			"--name": String,
			"--snake-case" : Boolean,
			"--table-name" : String,
			"--primary-key" : String,
			"--incrementing" : Boolean,
			"--key-type" : String,
			"--timestamps" : Boolean,
			"--date-format" : String,
			"--created-at" : String,
			"--updated-at" : String,
			"--connection" : String,
			// ALIASES
			"-n" : "--name",
			"-c" : "--snake-case",
			"-t" : "--table-name",
			"-p" : "--primary-key",
			"-a" : "--incrementing",
			"-k" : "--key-type",
			"-s" : "--timestamps",
			"-d" : "--date-format",
			"-i" : "--created-at-name",
			"-u" : "--updated-at-name",
			"-d" : "--connection"
		},
		{
			argv: process.argv.slice(4)
		});

		args["--name"] = process.argv[3];
		return args;
	}

	commands[process.argv[2]]({
		args: argsToOptions(),
		cwd: process.cwd(),
		fs
	})
}