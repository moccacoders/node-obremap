import User from '../../setup/models/user'

describe('Model.update()', () => {
  afterEach( async () => {
    let user = await User.update({ name: "Bob" }, 1)
  } )

  it('update a row', async function() {
    let user = await User.update({ name: "Raymundo" }, 1)
    expect(user.name).to.be.equal("Raymundo")
  })

  it('update a row with object', async function() {
    let user = await User.update({ name: "Raymundo" }, { id : 1 })
    expect(user.name).to.be.equal("Raymundo")
  })
  
  it('update a row without id', async function() {
	try{
	  let user = await User.update({ name: "Raymundo" })
	}catch(err){
	  expect(err.message).to.be.equal("Missing 'id' value or where object. [integer, object]")
	}
  })
})