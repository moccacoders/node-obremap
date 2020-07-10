// ########################################
//   REVISAR POR QUE SE DETIENE TERMINANDO
//   "Create Connection with Config File"
// ########################################

const EOL = require('os').EOL;
const expect = require('chai').expect;
const fs = require("fs");
const moment = require("moment");
const path = require('path');
const root = require("app-root-path");

const configFilePath = path.join(root.path, "/obremap.config.js");
const configFilePathTest = path.join(root.path, "/obremap.config.test");
const cmd = require('../../../setup/cli/cmd');
const { ENTER, DOWN } = cmd;
const cliPath = path.join(__dirname, "/../../../../", "modules/cli/index.mjs");

describe('Obremap CLI - Models', () => {
	before(() => {
		fs.rmdirSync(path.join(root.path, "/models"), { recursive : true });
	})

	after(() => {
		fs.rmdirSync(path.join(root.path, "/models"), { recursive : true });
	})

	it('create model with defaults', async () => {
		const response = await cmd.execute(
			cliPath,
			"make:model",
			[
				ENTER,
				ENTER,
				ENTER,
				ENTER,
				ENTER,
				ENTER,
				ENTER,
				ENTER,
				"n",
				ENTER,
				`default_${moment().unix()}`,
				ENTER,
				"n",
					ENTER,
			],
			{
				timeout : 800
			}
		);

		let resp = response.trim().split(EOL);
		expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
	});

	describe("Test languages", () => {
		it('english', async () => {
			const response = await cmd.execute(
				cliPath,
				"make:model",
				[
					ENTER
				]
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 2])
			.to.match(/What driver do you want to work with/);
		});

		it('spanish', async () => {
			const response = await cmd.execute(
				cliPath,
				"make:model",
				[
					DOWN,
					ENTER
				]
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 2])
			.to.match(/Con qué driver deseas trabajar/);
		});
	})
});