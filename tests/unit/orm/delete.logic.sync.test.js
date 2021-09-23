import User from '../../setup/models/user-logical'
import OtherUser from '../../setup/models/user'
let id = null;

describe('Logical remove Model.deleteSync()', () => {
	before( () => {
		let user = User.createSync({ id, name: "Bob" })
		id = user.id
	} )

	after( () => {
		let user = User.deleteSync({ id }, false)
	} )

	it('logical delete with id', () => {
		let user = User.deleteSync(id)
		expect(user.eliminado).to.be.equal(1)
		expect(/([\d]{4,4})-([\d]{2,2})-([\d]{2,2})(.*)/.test(user.fecha_de_eliminacion)).to.be.equal(true)
	})

	it('logical delete with deleted_by', () => {
		let user = User.deleteSync(id, 12);
		expect(user.eliminado).to.be.equal(1)
		expect(user.eliminado_por).to.be.equal(12)
		expect(/([\d]{4,4})-([\d]{2,2})-([\d]{2,2})(.*)/.test(user.fecha_de_eliminacion)).to.be.equal(true)
	})

	it('logical delete with deleted_by', () => {
		let user = OtherUser.deleteSync(id, 12)
		expect(user.deleted).to.be.equal(1)
		expect(user.deleted_by).to.be.equal(12)
		expect(/([\d]{4,4})-([\d]{2,2})-([\d]{2,2})(.*)/.test(user.deleted_at)).to.be.equal(true)
	})
})