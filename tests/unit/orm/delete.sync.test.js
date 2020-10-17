import User from '../../setup/models/user'
let id = null;

describe('Model.deleteSync()', () => {
	beforeEach( () => {
		let user = User.createSync({ id, name: "Bob" })
		id = user.id
	} )

	after( () => {
		let user = User.deleteSync({ id })
	} )

	it('delete a row with id', () => {
		let user = User.deleteSync(id)
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object', () => {
		let user = User.deleteSync({ id })
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder. IS NOT NULL (<>)', () => {
		let user = User.where({ id }).where({ id : "<> null"}).deleteSync();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder with string. IS NOT NULL (!=)', () => {
		let user = User.where(`id = ${id}`).where({ id : "!= null"}).deleteSync();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder with string. IS NOT NULL (<>)', () => {
		let user = User.where(`id = ${id}`).where({ id : "<> null"}).deleteSync();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row with object on builder with string', () => {
		let user = User.where(`id = ${id}`).where({ user_profile_id : null}).deleteSync();
		expect(user.affectedRows).to.be.greaterThan(0)
	})

	it('delete a row without id', () => {
		try{
			let user = User.deleteSync()
		}catch(err){
			expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
		}
	})
})