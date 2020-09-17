import Chat from '../../../setup/models/relationships/chat'
import User from '../../../setup/models/relationships/user'

describe('Chat.user() and User.chats()', () => {
  it('lazy loads user', async function() {
    let chat = await Chat.with("user", "images").first();
    let images = await chat.images.get();
    let user = await chat.user;

    expect(images.length).to.be.greaterThan(0)
    expect(user.name).to.be.equal('Bob')
  })

  it('lazy loads chats', async function() {
    let user = await User.first()
    let chat = await user.chats.get()

    expect(chat[0].user_id).to.be.equal(user.id)
  })

  it('lazy loads chats test', async function() {
    let user = await Chat.where({id : 1}).with("user").first()

    expect(user.id).to.be.equal(1)
  })

  //these arent as pretty since you have to new up the class :(
  //need to find a way to make it static.
  // it('eager loads user', async function() {
  //   let chat = await new Chat().with("user", "images").first();
  //   let user = await chat.user;
  //   console.log(user);
    
  //   // expect(chat.user.name).to.be.equal('Bob')
  //   // expect(chat.chat_images.source).to.be.equal('/logo.png')
  //   // expect(chat.user_id).to.be.equal(chat.user.id)
  //   expect(true).to.be.equal(true)
  // })

  // it('eager loads chats', async function() {

  //   let user = await new User().with('chats').first()
  //   expect(user.chats.user_id).to.be.equal(user.id)
  // })

})