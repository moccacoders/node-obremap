import Chunk from '../../setup/models/chunk'
import Chat from '../../setup/models/chat'

describe('Model.count()', () => {
	it('Get total of rows', async function() {
		let chunks = await Chunk.count();
		console.log(chunks)
		expect(typeof chunks).to.be.equal("number")
		expect(chunks).to.be.greaterThan(117979)
	})

	it('Get total of specific rows', async function() {
		let chats = await Chat.where({ messages : "blah" }).count();
		expect(typeof chats).to.be.equal("number")
		expect(chats).to.be.greaterThan(0)
	})
})
