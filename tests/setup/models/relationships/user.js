import { Model } from '../../../../modules'
import Chat from './chat'
import Profile from './user-profile'
import ThroughChatImages from './through-chat-images';
import ChatImages from './chat-images';

export default class User extends Model {
	chats(model) {
		return this.hasMany(Chat)
	}

	images (model) {
		return this.hasManyThrough(ChatImages, ThroughChatImages);
	}

	profile(model){
		return this.hasOne(Profile)
	}
}
