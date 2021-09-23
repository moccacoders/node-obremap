import UserMigration from '../../setup/migrations/user.migration'
import UserSeed from '../../setup/seeds/user.seed'

describe('Migrations', () => {
	let migration = new UserMigration
	it('down()', function() {
		migration.down();
	})

	it('up()', function() {
		migration.up();
	})
})

describe('Seeds', () => {
	it ('run()', () => {
		UserSeed.run();
	})
})
