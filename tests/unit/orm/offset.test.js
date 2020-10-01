import Chat from '../../setup/models/chat'

describe('Model.offset()', () => {
	it('Get rows with limit and offset', async function() {
		let chats = await Chat.offset(0).limit(10).get()
		expect(chats.length).to.be.equal(10)
		expect(chats[0].id).to.be.equal(1)
		expect(chats[chats.length - 1].id).to.be.equal(10)
	})

	it('Get specific rows with limit and offset', async function() {
		let chats = await Chat.where({ messages : "blah" }).offset(10).limit(20).get();
		expect(chats.length).to.be.equal(20)
		expect(chats[0].id).to.be.equal(35)
		expect(chats[chats.length - 1].id).to.be.equal(73)
	})
})
