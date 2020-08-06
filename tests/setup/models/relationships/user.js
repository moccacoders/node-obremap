import { Model } from '../../../../modules'
import Chat from './chat'
import Profile from './user-profile'

export default class User extends Model {
	chats(model) {
		return this.hasMany(Chat)
	}

	profile(model){
		return this.hasOne(Profile)
	}
}
