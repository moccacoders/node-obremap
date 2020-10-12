import Chunk from '../../setup/models/chunk'
import Chat from '../../setup/models/chat'
import Count from '../../setup/models/count'

describe('Model.countSync()', () => {
	it('Get total of rows', () => {
		let chunks = Chunk.countSync();
		expect(typeof chunks).to.be.equal("number")
		expect(chunks).to.be.greaterThan(117979)
	})

	it('Get total of specific rows', () => {
		let chats = Chat.where({ messages : "blah" }).countSync();
		expect(typeof chats).to.be.equal("number")
		expect(chats).to.be.greaterThan(0)
	})

	it('Get zero rows', () => {
		let count = Count.where({ id : 1 }).countSync()
		expect(typeof count).to.be.equal("number")
		expect(count).to.be.equal(0)
	})
})
