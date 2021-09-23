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
			table.string('username',45).default('username');
			table.string('email',150).default('email');
			table.string('password',250).default('password');
			table.integer('role_id').default(1);
			table.integer('config_id').default(1);
			table.string('name',45).default('name');
			table.string('mothers_surname',45).default('mothers_surname');
			table.string('fathers_surname',45).default('fathers_surname');
			table.string('curp',20).default('curp');
			table.string('rfc',15).default('rfc');
			table.string('phone',15).default('phone');
			table.integer('status').default(1);
			table.integer('user_profile_id').nullable();
			table.integer('created_by').nullable();
			table.timestamps();
			table.boolean('deleted').nullable();
			table.timestamp('deleted_at').nullable();
			table.integer('deleted_by').nullable();
			table.timestamp('test').nullable()
			table.boolean('eliminado').nullable();
			table.integer('eliminado_por').nullable();
			table.timestamp('fecha_de_eliminacion').nullable();

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
		Schema.drop('users')
	}
}