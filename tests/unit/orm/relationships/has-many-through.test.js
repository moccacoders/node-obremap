import Chat from '../../../setup/models/relationships/chat'
import User from '../../../setup/models/relationships/user'
import ChatImages from '../../../setup/models/relationships/chat-images.js'
import _ from 'lodash';

describe('Model.hasManyThrough()', () => {
	it('tests hasManyThrough directly', function() {
		let chat = Chat.with('imagesThrough').limit(10).getSync();
		console.log(chat);

		// expect(chat.length).to.be.greaterThan(1)
		// expect(chat[0].user_id).to.be.equal(23)
		// expect(chat[200].user_id).to.be.equal(23)
	})

	// it('tests hasMany with set values', async function() {
	// 	let chat = await new User({ id: 23 }).hasMany(Chat, 'id', 'user_id').result().get()

	// 	expect(chat.length).to.be.greaterThan(1)
	// 	expect(chat[0].user_id).to.be.equal(23)
	// 	expect(chat[200].user_id).to.be.equal(23)
	// })

	// it('returns join statement', async function() {
	// 	let rawQuery = await new User({ id: 1 }).hasMany(Chat, 'id', 'user_id')

	// 	expect(rawQuery.includeTable).to.be.equal('chats')
	// 	expect(rawQuery.localField).to.be.equal('users.id')
	// 	expect(rawQuery.remoteField).to.be.equal('chats.user_id')
	// })

	// it('test hasMany return non-empty array', async function(){
	// 	let images = await new Chat({ id : 1 }).hasMany(ChatImages).result().get();
	// 	expect(images.length).to.be.greaterThan(0);
	// })

	// it('test hasMany return empty array', async function(){
	// 	let images = await new Chat({ id : 0 }).hasMany(ChatImages).result().get();
	// 	expect(images.length).to.be.equal(0);
	// })
})