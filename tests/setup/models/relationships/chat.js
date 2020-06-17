import { Model } from '../../../../modules'
import User from './user'
import ChatImages from './chat-images'

export default class Chat extends Model {
	static timestamps = false;
	static tableName = "chats";

	images () {
		return this.hasMany(ChatImages);
	}

	user() {
		return this.hasOne(User)
	}
}
