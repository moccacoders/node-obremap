const utils = require("../../../modules/config/utils.js");

describe("Prototypes", () => {
	it("object isn't empty", () => {
		let obj = {
			hello : "world"
		}
		expect(obj.empty).to.be.equal(false);
	})

	it("object is empty", () => {
		let obj = {}
		expect(obj.empty).to.be.equal(true);
	})

	it("find by value", () => {
		let obj = [{
			hello : "world"
		}]
		expect(obj.findByValue("hello", "world")).to.be.equal(true);
		expect(obj.findByValue("hello", "hello")).to.be.equal(false);
	})
})

describe("Utils", () => {
	it("uncapitalize", () => {
		expect(utils.uncapitalize("Hello World")).to.be.equal("hello world");
	})

	it("capitalize", () => {
		expect(utils.capitalize("hello world")).to.be.equal("Hello World");
	})

	it("to case", () => {
		expect(utils.toCase("hello world", true)).to.be.equal("hello_world");
		expect(utils.toCase("helloWorld", true, true)).to.be.equal("Hello_world");
		expect(utils.toCase("hello world", true, true)).to.be.equal("Hello_world");
		expect(utils.toCase("hello world", false)).to.be.equal("helloWorld");
		expect(utils.toCase("hello world", false, true)).to.be.equal("HelloWorld");
	})
})

require("../../../modules/config/prototypes.config.js");