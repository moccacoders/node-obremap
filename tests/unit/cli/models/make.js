const expect = require('chai').expect;
const path = require('path');
const { EOL } = require('os');

const cmd = require('../../../setup/cli/cmd');
const { ENTER, DOWN } = cmd;
const cliPath = path.join(__dirname, "/../../../../", "modules/cli/index.mjs");

describe('Obremap CLI', () => {
	it('create model with defaults', async () => {
		const response = await cmd.execute(
			cliPath,
			"make:model",
			[]
		);

		expect(response.trim().split(EOL)[0])
		.to.match(/What language do you prefer/);
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