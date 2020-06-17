import User from '../../setup/models/user'

describe('Model.delete()', () => {
	beforeEach( async () => {
		let user = await User.create({ id: 2, name: "Bob" })
	} )

	after( async () => {
		let user = await User.delete({ id: 2 })
	} )

	it('delete a row with id', async function() {
		let user = await User.delete(2)
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object', async function() {
		let user = await User.delete({ id : 2 })
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