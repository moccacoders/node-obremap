import { Model } from '../../../modules'

export default class User extends Model {
	static logicalDelete = true;
	static timestamps = true;
	static timezone = "America/Bogota";

	static deleted = "eliminado";
	static deleted_by = "eliminado_por";
	static deleted_at = "fecha_de_eliminacion";
}
