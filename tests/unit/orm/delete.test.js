import User from '../../setup/models/user'
let id = null;

describe('Model.delete()', () => {
	beforeEach( async () => {
		let user = await User.create({ id, name: "Bob" })
		id = user.id
	} )

	after( async () => {
		let user = await User.delete({ id })
	} )

	it('delete a row with id', async function() {
		let user = await User.delete(id)
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object', async function() {
		let user = await User.delete({ id })
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder. IS NOT NULL (<>)', async () => {
		let user = await User.where({ id }).where({ id : "<> null"}).delete();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder with string. IS NOT NULL (!=)', async () => {
		let user = await User.where(`id = ${id}`).where({ id : "!= null"}).delete();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder with string. IS NOT NULL (<>)', async () => {
		let user = await User.where(`id = ${id}`).where({ id : "<> null"}).delete();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder with string', async () => {
		let user = await User.where(`id = ${id}`).where({ user_profile_id : null}).delete();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row without id', async function() {
		try{
			let user = await User.delete()
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})
})