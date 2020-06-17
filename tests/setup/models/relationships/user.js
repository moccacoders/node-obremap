import { Model } from '../../../../modules'
import Chat from './chat'
import Profile from './user-profile'

export default class User extends Model {
	chats() {
		return this.hasMany(Chat)
	}

	profile(){
		return this.hasOne(Profile)
	}
}
