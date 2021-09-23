import { Seeder, DB } from '../../../modules'

module.exports = class CatalogAddressTypes extends Seeder{
	/**
	 * Run seeder.
	 * @return void
	 */
	static run() {
		DB.table('users').truncate();
		DB.table('users').timestamps(true).set([
			{
				username : 'raymundo',
				email : 'contacto@moccacoders.com',
				password : 'p4$$w0rd',
				role_id : 1,
				config_id : 2,
				name : 'Bob',
				mothers_surname : 'Salazar',
				fathers_surname : 'Serrato',
				curp : 'ABCD123456HNLRL00',
				rfc : 'ABCD123456HNL',
				phone : '123456789',
				status : 1
			}
		]).create();
	}
}