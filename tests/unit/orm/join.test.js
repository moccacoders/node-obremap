import Chat from '../../setup/models/chat'

describe('Model.join()', () => {
	it('Left Join complete with AS', async function() {
		let chat = await Chat.join("users as u", "user_id", "=", "u.id", "left").first()
		expect(chat.u.name).to.be.equal("Bob")
	})

	it(' ´´ ', async function() {
		let chat = await Chat.join("users", "user_id", "=", "users.id").first()
		expect(chat.user.name).to.be.equal("Bob")
	})

	it('Inner Join without type and operator', async function() {
		let chat = await Chat.join("users", "user_id", "users.id").join("chat_images", "chat_images.chat_id", "chats.id").first()
		expect(chat.user.name).to.be.equal("Bob")
	})

	it('Inner Join without type and operator', async function() {
		let chat = await Chat.where({ 'chats.user_id': 23 }).join("users", "user_id", "users.id", "left").first()
		expect(chat.user_id).to.be.equal(23)
	})

	it('Inner Join without type and operat', async function() {
		let chat = await Chat.where({ 'chats.user_id': 23 }).join("users", "user_id", "=", "users.id", "left").first()
		expect(chat.user_id).to.be.equal(23)
	})

})
