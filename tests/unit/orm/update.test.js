import User from '../../setup/models/user'
import OtherUser from '../../setup/models/user-logical'

describe('Model.update()', () => {
	afterEach(async () => {
		await User.update({ name: "Bob" }, 1)
		await User.where({ id : 3, user_profile_id : "!=null" }).set({ user_profile_id : null }).update();
		await User.where({ "users.id" : 3, user_profile_id : "<>null" }).set({ "users.user_profile_id" : null }).update();
		await User.where({ id : 3, user_profile_id : "<=>null" }).set({ user_profile_id : null }).update();
		await User.where({ created_at : null }).where("id = 3").set({ user_profile_id : null }).update();
	})

	it('update a row', async function() {
		let user = await User.update({ name: "Raymundo" }, 1)
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with object', async function() {
		let user = await User.update({ name: "Raymundo" }, { id : 1 })
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with id on data', async function() {
		let user = await User.update({ name: "Raymundo", "users.id": 1 })
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with id on data with where id', async function() {
		let user = await OtherUser.update({ name: "Raymundo", id: 1 }, 1)
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with id on data with where id', async function() {
		let user = await User.where({ id : 1 }).set({ name : "Raymundo", updated_at : new Date() }).update();
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row without id', async function() {
		try{
			let user = await User.update({ name: "Raymundo" })
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})

	it('update a row with id on data with where id', async function() {
		try{
			let user = await User.set({ user_profile_id : 1 }).update();
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})
})