import Chat from '../../setup/models/chat'

const root = require("app-root-path");
const path = require("path");
const fs = require("fs");
const configFilePath = path.join(root.path, "/obremap.config.js");
const configFilePathTest = path.join(root.path, "/obremap.config.test");

describe('Model.all()', () => {
	// before(() => {
	// 	fs.rename(configFilePath, configFilePathTest, err => {
	// 		if(err) return console.log(err);
	// 	});
	// })

	// after(() => {
	// 	fs.rename(configFilePathTest, configFilePath, err => {
	// 		if(err) return console.log(err);
	// 	});
	// })

	// it('grabs all', async function() {
	// 	await Chat.create({ messages: 'blah' })
	// 	let chats = await Chat.all()
	// 	expect(chats.length).to.be.above(0)
	// 	expect(typeof chats).to.equal('object')
	// })

	// it('grabs all with order by as object', async function() {
	// 	await Chat.create({ messages: 'blah' })
	// 	let chats = await Chat.orderBy({ created_at : "asc" }).all()
	// 	expect(true).to.be.equal(true)
	// })

	// it('grabs all with order by as string', async function() {
	// 	await Chat.create({ messages: 'blah' })
	// 	let chats = await Chat.orderBy("created_at asc").all()
	// 	expect(true).to.be.equal(true)
	// })

	// it('grabs all with order by as array', async function() {
	// 	await Chat.create({ messages: 'blah' })
	// 	let chats = await Chat.orderBy(["created_at asc"]).all()
	// 	expect(true).to.be.equal(true)
	// })

	it('test sync get all', () => {
		let chats = Chat.where({ user_id : 1 })
		.join("users", "chats.user_id", "users.id")
		.join("users as u", "chats.user_id", "u.id")
		.getSync();

		expect(chats[0].users.id).to.be.equal(1);
		expect(chats.length).to.be.equal(1);
	})

	it('test sync get all', () => {
		let chats = Chat.where({ user_id : 1 })
		.select("id, chats.user_id, users.name, users.id")
		.join("users", "chats.user_id", "users.id")
		.join("users as u", "chats.user_id", "u.id")
		.getSync();

		expect(chats[0].users.id).to.be.equal(1);
		expect(chats.length).to.be.equal(1);
	})
})
