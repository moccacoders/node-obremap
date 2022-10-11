// THIS MODEL FILE WAS CREATED BY OBREMAP CLI
const Model = require("orm/model").default;
module.exports = class User extends Model {
  /*
		overwrite table name, this action is optional
		static tableName = "table_name";
	*/
  static tableName = "usuarios";
  static primaryKey = "user_id";
  static incrementing = false;
  static keyType = "string";
  static timestamps = false;
  static dateFormat = "DD-MM-YYYY HH:mm:ss";
  static createdAt = "creado";
  static updatedAt = "actualizado";
  static timezone = "America/Los_Angeles";
  static connection = "test";
  static logicalDelete = true;
  static deleted = "eliminado";
  static deletedAt = "fecha_eliminado";
  static deletedBy = "eliminado_por";
};
