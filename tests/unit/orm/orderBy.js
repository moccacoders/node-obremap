import Chat from '../../setup/models/chat'

describe('Model.orderBy()', () => {
	it('order by created_at desc', async function() {
		let chat = await Chat.orderBy({ created_at : 'desc' }).get()
		expect(chat.length).to.be.greaterThan(1)
		expect(typeof chat).to.equal('object')
	})

	it('order by created_at asc with string', async function() {
		let chat = await Chat.orderBy('created_at asc').get()
		expect(chat.length).to.be.greaterThan(1)
		expect(typeof chat).to.equal('object')
	})

	it('order by created_at desc with array', async function() {
		let chat = await Chat.orderBy(['created_at asc', 'updated asc']).get()
		expect(chat.length).to.be.greaterThan(1)
		expect(typeof chat).to.equal('object')
	})

	it('order by with where', async function() {
		let chat = await Chat.where({ user_id : 23 }).orderBy({ created_at : 'desc' }).get()
		expect(chat.length).to.be.greaterThan(1)
		expect(typeof chat).to.equal('object')
	})
})
