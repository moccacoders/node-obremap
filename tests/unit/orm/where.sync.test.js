import Chat from '../../setup/models/chat'

describe('Model.where() Sync Ends', () => {
  it('grabs by id', function() {
    let chat = Chat.where({ id: 1 }).getSync()
    expect(chat.length).to.be.equal(1)
    expect(typeof chat).to.equal('object')
  })

  it('grabs by messages', function() {
    let chat = Chat.where({ messages: 'blah' }).getSync()
    expect(chat[0].messages).to.be.equal('blah')
    expect(chat[0].id).to.be.ok
  })

  it('grabs by user_id null', function() {
    let chat = Chat.where({ user_id: null }).getSync();
    expect(chat[0].messages).to.be.equal('bleh')
    expect(chat[0].id).to.be.equal(3);
  })

  it('grabs by chats.user_id null', function() {
    let chat = Chat.where({ "chats.user_id": null }).getSync();
    expect(chat[0].messages).to.be.equal('bleh')
    expect(chat[0].id).to.be.equal(3);
  })

  it('grabs by messages - is not', function() {
    let chat = Chat.where({ messages: '!= blah' }).getSync()
    expect(chat.length).to.be.greaterThan(2)
    expect(chat[0].messages).to.be.equal('bleh')
    expect(chat[0].id).to.be.equal(3);
  })

  it('grabs by messages - nested is not', function() {
    let chat = Chat.where({ messages: '!= blah' }).where({ messages : "!= bleh" }).getSync()
    expect(chat.length).to.be.greaterThan(2)
    expect(chat[0].messages).to.be.equal('blih')
    expect(chat[0].id).to.be.equal(11);
  })

  it('grabs by messages - nested is not', function() {
    let chat = Chat.where({ messages: '!= blah' }).where("messages != 'bleh'").toSql()
    expect(chat).to.be.equal("SELECT * FROM chats WHERE `chats`.`messages` != 'blah' AND messages != 'bleh'")
  })
})
