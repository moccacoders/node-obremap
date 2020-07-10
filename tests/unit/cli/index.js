const EOL = require('os').EOL;
const expect = require('chai').expect;
const fs = require("fs");
const moment = require("moment");
const path = require('path');
const root = require("app-root-path");

const configFilePath = path.join(root.path, "/obremap.config.js");
const configFilePathTest = path.join(root.path, "/obremap.config.test");
const cmd = require('../../setup/cli/cmd');
const { ENTER, DOWN } = cmd;
const cliPath = path.join(__dirname, "/../../../", "modules/cli/index.mjs");

describe('Obremap CLI - General', () => {
	after(() => {
		fs.rmdirSync(path.join(root.path, "/models"), { recursive : true });
	})

	describe('Create model with connection - Config File', () => {
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

		it("creating model and config file", async() => {
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
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 3]).to.match(/The OBREMAP config file was CREATED/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		})

		it("updating model and config file", async () => {
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
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					ENTER,
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 3]).to.match(/The OBREMAP config file was UPDATED/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		});

		it("updating empty config file", async () => {
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
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					ENTER,
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 3]).to.match(/The OBREMAP config file was CREATED/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		});
	});

	describe("Create model with connection - No Config File", () => {
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
					ENTER,
					"n",
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length-11]).to.match(/ENVIRONMENTAL VARIABLES FOR THE CONNECTION/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		});
	})

	describe("Create model with connection url", () => {
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
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 3]).to.match(/The OBREMAP config file was CREATED/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		})

		it("with url wizard", async () => {
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
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 3]).to.match(/The OBREMAP config file was UPDATED/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		})
	})

	describe("Create model with multiple connection", () => {
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
					ENTER,
					"y",
					ENTER,
					ENTER,
					ENTER,
					"mysql://user:pass@localhost/database",
					ENTER,
					ENTER,
					ENTER,

					ENTER,
					ENTER,
					"mysql://user:pass@localhost/other",
					ENTER,
					`other_${moment().unix()}`,
					ENTER,
					"n",
					ENTER
				],
				{
					timeout : 800
				}
			);

			let resp = response.trim().split(EOL);
			expect(resp[resp.length - 3]).to.match(/The OBREMAP config file was CREATED/);
			expect(resp.pop()).to.match(/The OBREMAP model file was CREATED/);
		})
	})
});

