import Chat from '../../setup/models/chat'
import User from '../../setup/models/user'
import UserProfile from '../../setup/models/user-profile'

describe('Model.createSync()', () => {
	it('creates a row with automatic created and updated at field', () => {
		let chat = Chat.createSync({ user_id: 23 })
		expect(chat.user_id).to.be.equal(23)
	})

	it('creates a row with created and update at field on builder mode', () => {
		let chat = Chat.set({ user_id: 23, created_at : new Date(), updated: new Date() }).createSync()
		expect(chat.user_id).to.be.equal(23)
	})

	it('creates a row with created and update at field', () => {
		let chat = User.createSync({ name : "Bob", created_at : new Date(), user_profile_id : true })
		expect(chat.name).to.be.equal("Bob")
	})

	it('creates a row without created and update at field', () => {
		let profile = UserProfile.createSync({ full_name: "Raymundo Salazar", user_id : 1 })
		expect(profile.user_id).to.be.equal(1)
	})
})
