const expect = require('chai').expect;
const path = require('path');
const { EOL } = require('os');

const cmd = require('../../../setup/cmd');
const { ENTER } = cmd;
const cliPath = path.join(__dirname, "/../../../../", "modules/cli");

describe('Obremap CLI', () => {
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
				ENTER,
				ENTER,
				ENTER,
				ENTER,
				ENTER
			]
		);

		expect(
			response
				.trim()
				.split(EOL)
				.pop()
		).to.match(/The OBREMAP model file was (CREATED|UPDATED)/); // Using chai-match plugin
	});
});