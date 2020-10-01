import Chat from '../../setup/models/chat'

describe('Model.limit()', () => {
  it('limits to 5', async function() {
    let chat = await Chat.limit(5).toSql()
    expect(chat).to.be.equal("SELECT * FROM chats LIMIT 5")
  })

  it('limits to 2 with where', async function() {
    let chat = await Chat.where({ messages: 'blah' }).limit(2).toSql()
    expect(chat).to.be.equal("SELECT * FROM chats WHERE `chats`.`messages` = 'blah' LIMIT 2")
  })

  it('limits to 2 with where', async function() {
    let chat = await Chat.toSql()
    expect(chat).to.be.equal("SELECT * FROM chats")
  })

})
