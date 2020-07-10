import Chat from '../../../setup/models/relationships/chat'
import User from '../../../setup/models/relationships/user'
import ChatImages from '../../../setup/models/relationships/chat-images.js'

describe('Model.hasMany()', () => {
	it('tests hasMany directly', async function() {
		let chat = await new User({ id: 1 }).hasMany(Chat).result().first()
		expect(chat.user_id).to.be.equal(1)
	})

	it('tests hasMany with set values', async function() {
		let chat = await new User({ id: 1 }).hasMany(Chat, 'id', 'user_id').result().first()

		expect(chat.user_id).to.be.equal(1)
	})

	it('returns join statement', async function() {
		let rawQuery = await new User({ id: 1 }).hasMany(Chat, 'id', 'user_id')

		expect(rawQuery.includeTable).to.be.equal('chats')
		expect(rawQuery.localField).to.be.equal('users.id')
		expect(rawQuery.remoteField).to.be.equal('chats.user_id')
	})

	it('test hasMany return non-empty array', async function(){
		let images = await new Chat({ id : 1 }).hasMany(ChatImages).result().get();
		expect(images.length).to.be.greaterThan(0);
	})

	it('test hasMany return empty array', async function(){
		let images = await new Chat({ id : 0 }).hasMany(ChatImages).result().get();
		expect(images.length).to.be.equal(0);
	})
})