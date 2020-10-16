import { Model } from "../../../modules";
export default class UserProfile extends Model {
	static dateFormat = "TIMESTAMP";
	static tableName = "userProfiles";
	static timestamps = false;
}