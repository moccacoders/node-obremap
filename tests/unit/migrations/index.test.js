import UserMigration from '../../setup/migrations/user.migration'

describe('Migrations', () => {
	it('up()', function() {
		let migration = new UserMigration
		migration.up();
	})
})
