import User from '../../setup/models/user';

describe('Model.find()', () => {
  it('finds a row with id', async function() {
    let user = await User.find(1)
    expect(user.id).to.be.equal(1)
  })
})
