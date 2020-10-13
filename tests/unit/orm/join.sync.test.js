import Chat from '../../setup/models/chat'

describe('Model.join() Sync Ends', () => {
	it('Left Join complete with AS', function() {
		let chat = Chat.join("users as u", "user_id", "=", "u.id", "left").firstSync()
		expect(chat.u.name).to.be.equal("Bob")
	})

	it(' ´´ ', function() {
		let chat = Chat.join("users", "user_id", "=", "users.id").firstSync()
		expect(chat.users.name).to.be.equal("Bob")
	})

	it('Inner Join without type and operator', function() {
		let chat = Chat.join("users", "user_id", "users.id").join("chat_images", "chat_images.chat_id", "chats.id").firstSync()
		expect(chat.users.name).to.be.equal("Bob")
	})

	it('Inner Join without type and operator', function() {
		let chat = Chat.where({ 'chats.user_id': 1 }).orWhere({ "users.name" : "Bob" }).join("users", "user_id", "users.id").firstSync()
		expect(chat.user_id).to.be.equal(1)
	})

	it('Inner Join without type and operator', function() {
		let chat = Chat.where({ 'chats.user_id': 1 }).join("users", "user_id", "=", "users.id", "left").firstSync()
		expect(chat.user_id).to.be.equal(1)
	})

})
