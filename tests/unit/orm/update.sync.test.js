import User from '../../setup/models/user'

describe('Model.updateSync()', () => {
	afterEach(() => {
		User.updateSync({ name: "Bob" }, 1)
		User.where({ id : 3, user_profile_id : "!=null" }).set({ user_profile_id : null }).updateSync();
		User.where({ "users.id" : 3, "users.user_profile_id" : "<>null" }).set({ user_profile_id : null }).updateSync();
		User.where({ id : 3, user_profile_id : "<=>null" }).set({ user_profile_id : null }).updateSync();
		User.where({ created_at : null }).where("id = 3").set({ user_profile_id : null }).updateSync();
	})

	it('update a row', () => {
		let user = User.updateSync({ name: "Raymundo" }, 1)
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with object', () => {
		let user = User.updateSync({ name: "Raymundo" }, { "users.id" : 1 })
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with id on data', () => {
		let user = User.updateSync({ name: "Raymundo", "users.id": 1 })
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with id on data with where id', () => {
		let user = User.updateSync({ name: "Raymundo", id: 1 }, 1)
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row with id on data with where id', () => {
		let user = User.where({ id : 1 }).set({ name : "Raymundo", updated_at : new Date() }).updateSync();
		expect(user.name).to.be.equal("Raymundo")
	})

	it('update a row without id', () => {
		try{
			let user = User.updateSync({ name: "Raymundo" })
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})

	it('update a row with id on data with where id', () => {
		try{
			let user = User.set({ user_profile_id : 1 }).updateSync();
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})
})