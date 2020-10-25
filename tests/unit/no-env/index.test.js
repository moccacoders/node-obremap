const root = require("app-root-path");
const path = require("path");
const fs = require("fs");
const configFilePath = path.join(root.path, "/obremap.config.js");
const configFilePathTest = path.join(root.path, "/obremap.config.test");
let databases;
let configFile = `require('dotenv').config();

module.exports = {
	"config": "test",
	"databases": {
		"default": process.env.DATABASE_URL_OTHER,
		"timezone": "America/Mexico_City",
		"test": {
			"host" : process.env.DB_HOST,
			"user" : process.env.DB_USERNAME,
			"password" : process.env.DB_PASSWORD,
			"database" : process.env.DB_NAME,
			"driver" : process.env.DB_DRIVER
		}
	}
}
`;
const modifyDriverFile = (action = "remove", key = "databases") => {
	try{
		let content = require(configFilePath);
		Object.entries(key != "databases" ? content : content[key]).map((elem, ind) => {
			let [key, val] = elem;
			if(key == "databases"){
				if(typeof val == "string"){
					let params = new URL(val);
					params.protocol = action == "remove" ? null : "mysql";
					content.databases[key] = params.toString()
				}
				if(typeof val == "object"){
					content.databases[key].driver = action == "remove" ? null : "mysql";
				}
			}else{
				if(action == "remove"){
					if(!databases) databases = content.databases;
					delete content.databases;
				}else{
					content.databases = databases;
				}
			}
		})
		
		fs.writeFileSync(configFilePath, action != "add" && key == "databases" ? `module.exports = ${JSON.stringify(content, null, "\t")}` : configFile, "utf8", err => {
			if(err) console.log(err);
		});
	}catch(e){ }
}

describe('Model Errors with config file', () => {
	before(() => {
		modifyDriverFile();
		Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
	})

	it('returns error when midding db driver', async function() {
		try{
			class Test extends require('../../../modules').Model { static connection = "test" }
			Test.first();
		}
		catch(e) {
			return expect(e.message).to.equal("You must specify process.env.DB_DRIVER before creating a model.")
		}
		expect(false).to.equal(true)
	})
})

describe('Model Errors with config file but without databases', () => {
	before(() => {
		modifyDriverFile("remove", "");
	});

	after(() => {
		fs.rename(configFilePath, configFilePathTest, err => {
			if(err) return console.log(err);
		});
	})

	it('returns error when midding db driver', async function() {
		try{
			class Test extends require('../../../modules').Model { }
			Test.first();
		}
		catch(e) {
			return expect(e.message).to.equal("You must specify process.env.DB_DRIVER before creating a model.")
		}
		expect(false).to.equal(true)
	})
})

describe('Model Errors without config file', () => {
	before(() => {
		process.env.DB_DRIVER = null
		Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
	})

	after(() => {
		process.env.DB_DRIVER = 'mysql'
		Object.keys(require.cache).forEach(function(key) { delete require.cache[key] })
		
		fs.rename(configFilePathTest, configFilePath, err => {
			if(err) console.log(err);
		});
		modifyDriverFile("add", "");
		modifyDriverFile("add");
	})

	it('returns error when midding db driver', async function() {
		try{
			class Test extends require('../../../modules').Model { }
			Test.first();
		}
		catch(e) {
			return expect(e.message).to.equal("You must specify process.env.DB_DRIVER before creating a model.")
		}
		expect(false).to.equal(true)
	})
})
