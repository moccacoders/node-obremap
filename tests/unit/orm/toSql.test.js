import Chat from '../../setup/models/chat'

describe('Model.limit()', () => {
  it('Get SQL with limit', async function() {
    let chat = await Chat.limit(5).toSql()
    expect(chat).to.be.equal("SELECT * FROM chats LIMIT 5")
  })

  it('Get SQL with columns and table names', async function() {
    let chat = await Chat.where({ messages: 'blah' }).limit(2).toSql()
    expect(chat).to.be.equal("SELECT * FROM chats WHERE `chats`.`messages` = 'blah' LIMIT 2")
  })

  it('get SQL from sync function', function() {
    let chat = Chat.toSql()
    expect(chat).to.be.equal("SELECT * FROM chats")
  })

})
