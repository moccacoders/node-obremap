import Chat from '../../setup/models/chat'

describe('Model.allSync()', () => {
	it('grabs all', function() {
		let chats = Chat.allSync()
		expect(chats.length).to.be.above(0)
		expect(typeof chats).to.equal('object')
	})

	it('grabs all with order by as object', function() {
		let chats = Chat.orderBy({ created_at : "asc" }).allSync()
		expect(true).to.be.equal(true)
	})

	it('grabs all with order by as string', function() {
		let chats = Chat.orderBy("created_at asc").allSync()
		expect(true).to.be.equal(true)
	})

	it('grabs all with order by as array', function() {
		let chats = Chat.orderBy(["created_at asc"]).allSync()
		expect(true).to.be.equal(true)
	})

	it('test sync get all', () => {
		let chats = Chat.where({ user_id : 1 })
		.join("users", "chats.user_id", "users.id")
		.join("users as u", "chats.user_id", "u.id")
		.allSync();

		expect(chats[0].users.id).to.be.equal(1);
		expect(chats.length).to.be.equal(1);
	})

	it('test sync get all', () => {
		let chats = Chat.where({ user_id : 1 })
		.select("id, chats.user_id, users.name, users.id")
		.join("users", "chats.user_id", "users.id")
		.join("users as u", "chats.user_id", "u.id")
		.allSync();

		expect(chats[0].users.id).to.be.equal(1);
		expect(chats.length).to.be.equal(1);
	})
})
