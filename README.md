### Node Eloquent

### Todo
- more drivers
- migrations support
- more cli tools

Node Eloquent is a fork of another project by [Zach Silveira](https://github.com/zackify) Done under [Construction Jobs
](https://github.com/ConstructionJobs). [Relation](https://github.com/ConstructionJobs/relation) is the original package which takes inspiration from knex and sequelize, but the end goal is to completely mimic Laravel's Eloquent package. In order to achieve the best syntax possible, we are using ES6 Proxies, which is now supported in the latest version of node. Currently, only mysql is supported, but adding a new driver is trivial.

## How to install?

```
npm install @moccacoders/node-eloquent --save

//if using mysql driver this is peer dependency anyway
npm install mysql --save
```

### Setup

You must set the following environment variables in your app. We recommend creating a `.env` file and using [dotenv](https://github.com/motdotla/dotenv) (this is a peer dependency)

```
DB_DRIVER=mysql
DB_HOST=localhost
DB_USERNAME=test
DB_PASSWORD=secret
DB_NAME=blah
```

### Create a Model

`chat.js`

```js
import { Model } from 'node-eloquent'

export default class Chat extends Model {

  /*
  overwrite table name, this function is optional

  static tableName() {
    return 'dashboard_chats'
  }
  */
}


```

### Using the Model

As long as the plural version of the model is available in the database (you can overwrite this), you can query the database.

```js
import Chat from './chat'

async function getChats {
  let chats = await Chat.all()
  console.log(chats)
}
```

#### Supported methods

- `.all()` returns everything in the table
- `.where({ fieldName: 'value' })` returns any matching results
- `.create({ field: 'value'})` create a new row
- `.update({ field: 'value' }, where)` update a new row
- `.delete(where)` delete a new row
- `.select('column', 'column2')` constraint rows to select
- `.first()` returns first results
- `.limit(5)` limits the query
- `find(<primary key>)` finds and returns a relation currently only `id` as primary key is supported but dynamic primary key is coming soon

### Query Building

```js

Chat.select('messages', 'id').where({ messages: 'blah' }).get()

Chat.where({ messages: 'blah' }).get()

Chat.select('messages').first()

Chat.where({ messages: 'blah' }).limit(2).get()

Chat.update({ name: 'Raymundo' }, { id : 1 })

Chat.delete(1)


```

### Relationships

This is a huge WIP, feel free to contribute :)

Supported:
- One To One
- One To Many

Todo:
- Many To Many
- Has Many Through
- Polymorphic Relations
- Many To Many Polymorphic Relations

#### One to One Example

```js
import { Model } from 'node-eloquent'


export default class User extends Model {

}

export default class Chat extends Model {
  user() {
    return this.hasOne(User)
  }
}

let chat = await Chat.first()

//any relationship will return a promise with the result
let user = await chat.user

expect(user.name).to.be.equal('Bob')

```

#### One to Many Example

```js
import { Model } from 'node-eloquent'


export default class User extends Model {
  chats() {
    return this.hasMany(Chat)
  }
}

export default class Chat extends Model {

}

let user = await User.first()

//has many results return a query builder instance
let chats = await user.chats.first()


```

### Migrations

Will go over this very soon...

### CLI

If you install node-eloquent globally (`npm install @moccacoders/node-eloquent -g`) you can access the CLI methods to help create migrations, models, etc.

#### Migrations

`eloquent make:migration User -m` -m will create a model as well

This will create a migration file that will allow you to build out tables.

#### Models

`eloquent make:model User`

Creates a file in your current directory `/models/user.js` with a default model
