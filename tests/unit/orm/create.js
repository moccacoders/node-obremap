import Chat from '../../setup/models/chat'
import UserProfile from '../../setup/models/user-profile'

describe('Model.create()', () => {
	it('creates a row with automatic created and updated at field', async function() {
		let chat = await Chat.create({ user_id: 23 })
		expect(chat.user_id).to.be.equal(23)
	})

	it('creates a row with created and update at field', async function() {
		let chat = await Chat.create({ user_id: 23, created_at : new Date(), updated: new Date() })
		expect(chat.user_id).to.be.equal(23)
	})

	it('creates a row without created and update at field', async function() {
		let profile = await UserProfile.create({ full_name: "Raymundo Salazar", user_id : 1 })
		expect(profile.user_id).to.be.equal(1)
	})
})
