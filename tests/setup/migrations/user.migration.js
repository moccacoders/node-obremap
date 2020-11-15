import { Schema } from '../../../modules'
/*
	Model Name: User
	Database Table: users
*/
export default class UserMigration {
	up() {
		Schema.create('users', table => {
			table.charset = "utf8";
			table.collation = "utf8_general_ci";

			table.increments("id");
			table.string('username',45);
			table.string('email',150);
			table.string('password',250);
			table.integer('role_id');
			table.integer('config_id');
			table.string('name',45);
			table.string('mothers_surname',45);
			table.string('fathers_surname',45);
			table.string('curp',20);
			table.string('rfc',15);
			table.string('phone',15);
			table.integer('status').default(1);
			table.integer('created_by').nullable();
			table.timestamp('created_at');
			table.timestamp('updated_at').nullable();
			table.timestamp('deleted_at').nullable();
			table.timestamp('test').nullable()

			// table.unsignedBigInteger('unsignedBigInteger');
			// table.unsignedDecimal('unsignedDecimal', 10);
			// table.unsignesdInteger('unsignedInteger');
			// table.unsignedMediumInteger('unsignedMediumInteger');
			// table.unsignedSmallInteger('unsignedSmallInteger');
			// table.unsignedTinyInteger('unsignedTinyInteger');
			// table.uuid('uuid');
			// table.year('year');
			// table.float('float');
			// console.log(table);
		})
	}
	down() {
		Schema.drop(users)
	}
}