import Chat from '../../setup/models/chat'

describe('Model.firstSync()', () => {
  it('grabs by id', function() {
    let chat = Chat.firstSync()
    expect(chat.id).to.be.equal(1)
    expect(chat.messages).to.equal('blah')
  })

  it('grabs first from where', function() {
    let chat = Chat.where({ messages: 'blah' }).firstSync()
    expect(chat.messages).to.be.equal('blah')
    expect(chat.id).to.be.ok
  })
})
