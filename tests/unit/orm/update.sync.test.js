const root = require("app-root-path");
const path = require("path");
const fs = require("fs");
import User from '../../setup/models/user'
import OtherUser from '../../setup/models/user-logical' 
const configFilePath = path.join(root.path, "/obremap.config.js");
const configFilePathTest = path.join(root.path, "/obremap.config.test");
let configFile = `require('dotenv').config();

module.exports = {
	"config": "test",
	"timezone" : "America/Mexico_City",
	"databases": {
		"default": process.env.DATABASE_URL_OTHER,
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

describe('Model.updateSync()', () => {
	before(() => {
		fs.rename(configFilePath, configFilePathTest, err => {
			if(err) return console.log(err);
		});
	})

	after(() => {
		fs.rename(configFilePathTest, configFilePath, err => {
			if(err) return console.log(err);
		});
	});

	afterEach(() => {
		User.updateSync({ name: "Bob" }, 1)
		User.where({ id : 3, user_profile_id : "!=null" }).set({ user_profile_id : null }).updateSync();
		User.where({ "users.id" : 3, "users.user_profile_id" : "<>null" }).set({ user_profile_id : null }).updateSync();
		User.where({ id : 3, user_profile_id : "<=>null" }).set({ user_profile_id : null }).updateSync();
		User.where({ created_at : null }).where("id = 3").set({ user_profile_id : null }).updateSync();
	})

	it('update a row with id on data with where id', () => {
		class Test extends require('../../../modules').Model { static tableName = "users"; static timezone = "America/Bogota"; }
		let user = Test.updateSync({ name: "Raymundo", id: 1 }, 1)
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row', () => {
		let user = User.updateSync({ name: "Raymundo" }, 1)
		expect(user.name).to.be.equal("Raymundo")

		process.env.TZ = "America/Monterrey";
	})

	it('update a row with object', () => {
		let user = User.updateSync({ name: "Raymundo" }, { "users.id" : 1 })
		expect(user.name).to.be.equal("Raymundo")
		delete process.env.TZ;
	})

	it('update a row with id on data', () => {
		let user = User.updateSync({ name: "Raymundo", "users.id": 1 })
		expect(user.name).to.be.equal("Raymundo")

		fs.writeFileSync(configFilePath, configFile, "utf8", err => {
			if(err) console.log(err);
		});
	})

	it('update a row with id on data with where id', () => {
		let user = User.where({ id : 1 }).set({ name : "Raymundo", updated_at : new Date() }).updateSync();
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row without id', () => {
		try{
			let user = User.updateSync({ name: "Raymundo" })
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})

	it('update a row with id on data with where id', () => {
		try{
			let user = User.set({ user_profile_id : 1 }).updateSync();
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})
})