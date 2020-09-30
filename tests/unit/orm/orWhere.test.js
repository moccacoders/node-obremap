import Chat from '../../setup/models/chat'

describe('Model.where()', () => {
  it('grabs two by id', async function() {
    let chat = await Chat.where({ id: 1 }).orWhere({ id : 2 }).get();
    expect(chat.length).to.be.equal(2);
    expect(typeof chat).to.equal('object');
  })

  it('grabs three by id', async function() {
    let chat = await Chat.where({ id: 1 }).orWhere({ id : 2 }).orWhere({ id : 3 }).get();
    expect(chat.length).to.be.equal(3);
    expect(typeof chat).to.equal('object');
  })
})
