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

describe('Obremap CLI - Connection', () => {
	describe("Create Connection with Config File", () => {
		before(() => {
			fs.rename(configFilePath, configFilePathTest, err => {
				if(err) console.log(err);
			});
		})

		afterEach(() => {
			try{
				let file = fs.readFileSync(configFilePath, "utf-8");
				let matches = file.match(/default_([0-9]+)/g);
				if(matches.length == 2){
					fs.writeFileSync(configFilePath, "", "utf-8");
				}
			}catch(e){
				console.log(e);
			}
		})

		after(() => {
			fs.rename(configFilePathTest, configFilePath, err => {
				if(err) console.log(err);
			});
		})

		it("creating config file", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					`default_${moment().unix()}`,
					ENTER,
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp.pop()).to.match(/The OBREMAP config file was CREATED/);
		});

		it("updating config file", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					`default_${moment().unix()}`,
					ENTER,
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp.pop()).to.match(/The OBREMAP config file was UPDATED/);
		});

		it("updating empty config file", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					`default_${moment().unix()}`,
					ENTER,
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp.pop()).to.match(/The OBREMAP config file was CREATED/);
		});
	})

	describe("Create Connection without Config File", () => {
		before(() => {
			fs.rename(configFilePath, configFilePathTest, err => {
				if(err) console.log(err);
			});
		})

		after(() => {
			fs.rename(configFilePathTest, configFilePath, err => {
				if(err) console.log(err);
			});
		})

		it("show env vars", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					"n",
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					`default_${moment().unix()}`,
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length-8]).to.match(/ENVIRONMENTAL VARIABLES FOR THE CONNECTION/);
		});
	})

	describe("Create connection url", () => {
		before(() => {
			fs.rename(configFilePath, configFilePathTest, err => {
				if(err) console.log(err);
			});
		})

		after(() => {
			fs.rename(configFilePathTest, configFilePath, err => {
				if(err) console.log(err);
			});
		})

		it("without url wizard", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					`default_${moment().unix()}`,
					ENTER,
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp.pop()).to.match(/The OBREMAP config file was CREATED/);
		})

		it("with url wizard", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"n",
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					`default_${moment().unix()}`,
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp.pop()).to.match(/The OBREMAP config file was UPDATED/);
		})
	})

	describe("Create multiple connection", () => {
		before(() => {
			fs.rename(configFilePath, configFilePathTest, err => {
				if(err) console.log(err);
			});
		})

		after(() => {
			fs.rename(configFilePathTest, configFilePath, err => {
				if(err) console.log(err);
			});
		})
		
		it("with connection url", async () => {
			const response = await cmd.execute(
				cliPath,
				"make:connection",
				[
					ENTER,
					ENTER,
					ENTER,
					"y",
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					`default_${moment().unix()}`,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@server/other",
					ENTER,
					`other-${moment().unix()}`,
					ENTER,
					"n",
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp.pop()).to.match(/The OBREMAP config file was CREATED/);
		})
	})
});
