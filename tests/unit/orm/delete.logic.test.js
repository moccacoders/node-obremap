import User from '../../setup/models/user-logical'
import OtherUser from '../../setup/models/user'
let id = null;

describe('Logical remove Model.delete()', () => {
	before( async () => {
		let user = await User.create({ id, name: "Bob" })
		id = user.id
	} )

	after( async () => {
		let user = await User.delete({ id }, false)
	} )

	it('logical delete with id', async () => {
		let user = await User.delete(id)
		expect(user.eliminado).to.be.equal(1)
		expect(typeof user.fecha_de_eliminacion).to.be.equal("object")
	})

	it('logical delete with deleted_by', async () => {
		let user = await User.delete(id, 12)
		expect(user.eliminado).to.be.equal(1)
		expect(user.eliminado_por).to.be.equal(12)
		expect(typeof user.fecha_de_eliminacion).to.be.equal("object")
	})

	it('logical delete with deleted_by', async () => {
		let user = await OtherUser.delete(id, 12)
		expect(user.deleted).to.be.equal(1)
		expect(user.deleted_by).to.be.equal(12)
		expect(typeof user.deleted_at).to.be.equal("object")
	})
})