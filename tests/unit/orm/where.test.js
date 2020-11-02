import Chat from '../../setup/models/chat'

describe('Model.where()', () => {
  it('grabs by id', async function() {
    let chat = await Chat.where({ id: 1 }).get()
    expect(chat.length).to.be.equal(1)
    expect(typeof chat).to.equal('object')
  })

  it('grabs by messages', async function() {
    let chat = await Chat.where({ messages: 'blah' }).get()
    expect(chat[0].messages).to.be.equal('blah')
    expect(chat[0].id).to.be.ok
  })

  it('grabs by user_id null', async function() {
    let chat = await Chat.where({ user_id: null }).get();
    expect(chat[0].messages).to.be.equal('bleh')
    expect(chat[0].id).to.be.equal(3);
  })

  it('grabs when user_id is not null (!=)', async function() {
    let chat = await Chat.where({ user_id: "!= null" }).first();
    expect(chat.messages).to.be.equal('blah')
    expect(chat.id).to.be.equal(1);
  })

  it('grabs when user_id is not null (<>)', async function() {
    let chat = await Chat.where({ user_id: "<> null" }).first();
    expect(chat.messages).to.be.equal('blah')
    expect(chat.id).to.be.equal(1);
  })

  it('grabs when user_id is not null (<=>)', async function() {
    let chat = await Chat.where({ user_id: "<=> null" }).first();
    expect(chat.messages).to.be.equal('blah')
    expect(chat.id).to.be.equal(1);
  })

  it('grabs by messages - is not', async function() {
    let chat = await Chat.where("messages != 'blah'").get()
    expect(chat.length).to.be.greaterThan(2)
    expect(chat[0].messages).to.be.equal('bleh')
    expect(chat[0].id).to.be.equal(3);
  })

  it('grabs by messages - nested is not', async function() {
    let chat = await Chat.where({ messages: '!= blah' }).where({ "chats.messages" : "!= bleh" }).get()
    expect(chat.length).to.be.greaterThan(2)
    expect(chat[0].messages).to.be.equal('blih')
    expect(chat[0].id).to.be.equal(11);
  })

  it('grabs by messages - nested is not', async function() {
    let chat = await Chat.where({ messages: 'like blah' }).where({ "chats.messages" : "!= bleh" }).where({ messages : "!= sfa" }).get()
    expect(chat.length).to.be.greaterThan(2)
    expect(chat[0].messages).to.be.equal('blih')
    expect(chat[0].id).to.be.equal(11);
  })

  it('grabs by messages - nested is not', async function() {
    let chat = await Chat.where({ messages: '!= blah' }).where("messages != 'bleh'").toSql()
    expect(chat).to.be.equal("SELECT * FROM chats WHERE `chats`.`messages` != 'blah' AND messages != 'bleh'")
  })
})
