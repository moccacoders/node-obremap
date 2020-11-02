import { Schema } from '../../../modules'
import { DB } from '../../../modules'

describe('Model.table()', () => {
	it('change table name', async function() {
		let chat = Schema.table("other_table").select('id').where({ id: 1 }).toSql()
		expect(chat.search("other_table")).to.be.greaterThan(0)
	})

	it('change table name on builde', async function() {
		let chat = DB.select('id').table("table_test").where({ id: 1 }).toSql()
		expect(chat.search("table_test")).to.be.greaterThan(0)
	})
})
