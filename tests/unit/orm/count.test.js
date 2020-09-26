import Chunk from '../../setup/models/chunk'
import Chat from '../../setup/models/chat'
import Count from '../../setup/models/count'

describe('Model.count()', () => {
	it('Get total of rows', async function() {
		let chunks = await Chunk.count();
		expect(typeof chunks).to.be.equal("number")
		expect(chunks).to.be.greaterThan(117979)
	})

	it('Get total of specific rows', async function() {
		let chats = await Chat.where({ messages : "blah" }).count();
		expect(typeof chats).to.be.equal("number")
		expect(chats).to.be.greaterThan(0)
	})

	it('Get zero rows', async function() {
		let count = await Count.where({ id : 1 }).count();
		console.log(count);
		expect(typeof count).to.be.equal("number")
		expect(count).to.be.equal(0)
	})
})
