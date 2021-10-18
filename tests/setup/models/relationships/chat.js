import { Model } from '../../../../modules'
import User from './user'
import ThroughChatImages from './through-chat-images';
import ChatImages from './chat-images'

export default class Chat extends Model {
	static timestamps = false;
	static tableName = "chats";

	images () {
		return this.hasMany(ChatImages);
	}

	imagesThrough () {
		return this.hasManyThrough(ChatImages, ThroughChatImages, 'chat_id', 'image_id');
	}

	user() {
		return this.hasOne(User);
	}
}
