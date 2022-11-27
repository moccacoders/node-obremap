# OBREMAP - Node ORM

 
<a href="https://opensource.org/licenses/MIT" target="_blank">![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)</a>
[![made-with-Go](https://img.shields.io/badge/Made%20with-NPM-6cc24a.svg)](https://nodejs.org)
<a href="https://www.npmjs.com/package/@moccacoders/node-obremap" target="_blank">![NPM Version](https://badge.fury.io/js/%40moccacoders%2Fnode-obremap.svg)</a>
![Testing Status](https://github.com/moccacoders/node-obremap/workflows/Run%20Tests%20and%20Coveralls/badge.svg?branch=master)
![Coverage Status](https://coveralls.io/repos/github/moccacoders/node-obremap/badge.svg?branch=dev)

**OBREMAP Node ORM** is an Object-Relational Mapping tool for Node JS based on the famous ORM of [Laravel](https://laravel.com/), [**Eloquent ORM**](https://laravel.com/docs/eloquent).
OBREMAP provides a beautiful and simple ActiveRecord implementation to work with your database. Each database table has a corresponding **"OBREMAP Model"** that is used to interact with that table.
Models allow you to query data in your tables, as well as insert new records into the table.

Before starting, make sure you configure your databases correctly. For more information on database configuration, see the [database configuration](#database-configuration).

## HOW TO INSTALL?

```
$ npm install @moccacoders/node-obremap --save
or
$ yarn add @moccacoders/node-obremap

// if using mysql driver this is peer dependency anyway
npm install mysql --save
```

## DATABASE CONFIGURATION

With **OBREMAP Node ORM** you have two ways with which you can configure your databases. The first is by adding your databases to the environment variables of your app and the second *(most recommended)* using the configuration file `obremap.config.js`.

#### -> Environment Variables

To configure your databases you must define the following variables:
```
DB_DRIVER = mysql
DB_HOST = localhost
DB_USERNAME = user
DB_PASSWORD = pass
DB_NAME = database_name
```

#### -> OBREMAP Configuration File

Although it is very easy to configure your databases just by adding the necessary environment variables, we recommend that you use the **OBREMAP configuration file**, this will allow you to configure your databases independently.
What you should do is create a file with the name `obremap.config.js` in the root folder of your application and add the following basic configuration.

* It is important to add the `default` key to the database configuration, as this will be the main information that will be used for the connection

``` js
module.exports = {
  databases: {
    default: {// IMPORTANT ADD "DEFAULT". THIS WILL BE THE MAIN CONNECTION INFORMATION
      host: "localhost",
      user: "user",
      password: "pass",
      database: "database_name",
      port: 3306,
      driver: "mysql"
    }
  }
}
```

### Configuration using URL's
Commonly, database settings use multiple settings such as `host`,` database`, `username`,` password`, etc. Each of them corresponds to an environment variable. This means that when you configure your databases on your production server, you will have to handle many environment variables.

Many of the database providers provide a single database connection "URL", which contains all the necessary information for the connection in a single string. An example of data-giving URLs looks very similar to this:

``` php
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

These URLs usually follow a standard schema convention:

``` php
driver://username:password@host:port/database?options
```

For your convenience, **OBREMAP Node ORM** supports these URLs as an alternative to configuring their databases with multiple configuration options. That is, if a database configuration URL is found (or its corresponding `DATABASE_URL` environment variable) it will be used to extract the database connection and credential information.

##### -> ENVIRONMENT VARIABLES
```
DATABASE_URL = mysql://root:password@127.0.0.1/database_name
```

##### -> OBREMAP CONFIGURATION FILE
The configuration is similar to the previous one. Only instead of saving an object within the default configuration, you should add the URL as a string.
``` js
module.exports = {
  databases: {
    default: "mysql://root:password@127.0.0.1/database_name"
  }
}
```

### Configuration of multiple databases

**OBREMAP Node ORM** provides the possibility of making multiple connections to multiple databases. You have no limit in terms of connections, you can configure all the connections you need, all the databases you require.
The configuration is similar to what was seen previously.

#### -> ENVIRONMENT VARIABLES

To configure multiple connections using the environment variables **OBREMAP Node ORM** take all the variables with the prefix `DB_` and assign the following value as the configuration variable. So if you put `DB_HOST` this will be the main configuration variable (` default`) that contains the database hostname. However, if you put an identifier after the `DB_` prefix, it will be taken as the connection name, it must be followed by the name of the connection variable, example:` DB_LOCAL_HOST` in this case the connection name will be `local `and the connection variable will be` host`.

```json
// MAIN CONNECTION
DB_DRIVER = mysql
DB_HOST = 127.0.0.1
DB_USERNAME = user
DB_PASSWORD = pass
DB_NAME=database_name

// SECONDARY CONNECTION [LOCAL]
DB_LOCAL_DRIVER=mysql
DB_LOCAL_HOST=localhost
DB_LOCAL_USERNAME=loca_user
DB_LOCAL_PASSWORD=local_pass
DB_LOCAL_NAME=other_database

```

#### -> OBREMAP CONFIGURATION FILE

Just as you can configure multiple connections to the database with a small modification in the environment variables, you can also do it using the **OBREMAP configuration file** the only thing you will have to do is add one more element to your object ` databases`, taking into account that the name you give to the new object will be the name of your connection.

``` js
module.exports = {
  databases: {
    // MAIN CONNECTION
    default: "mysql://root:password@127.0.0.1/database_name",
    // SECONDARY CONNECTION [LOCAL]
    local: "mysql://loca_user:local_pass@localhost/other_database"
  }
}
```

#### SELECT DATABASE

Once you have configured your multiple databases, what you should do is indicate to the model which connection to use. And this is only done by adding a static method within your model. Remember that the name you put here is the name you gave your connection in the multiple database connection settings.

``` js
import {Model} from 'node-obremap'

export default class Chat extends Model {
  static connection = "local";
}
```

### Create a Model

To begin, we will create a **Obremap Model**. Models are usually found in the root folder inside the **MODELS** folder, however you can place them where you prefer, as long as you can access them. All **OBREMAP Models** must extend from the `Model` class within **node-obremap**.
The easiest way to create your models is using the **Obremap CLI** with the `obremap make: model` function

`chat.js`

``` js
import {Model} from 'node-obremap'

export default class Chat extends Model {
  /*
    overwrite table name, this is optional
    static tableName = 'dashboard_chats';
  */
}

```

### Using the Model

Once you have created the **OBREMAP Model** (and associated the database table correctly), you are ready to get data from your databases. Think of OBREMAP Models as efficient query generators that will help you quickly make your queries to the database associated with your Models.
Example:

```js
import Chat from './chat'

async function getChats {
  let chats = await Chat.all()
  console.log(chats)
}
```

#### Supported methods

- `.all()` Returns everything in the table
- `.count()` Returns a numerical value corresponding to the total number of records extracted
- `.create({field: 'value'})` Create a new record
- `.delete(where || <primary key>)` Unregister
- `.find(<primary key>)` Find and return a relation currently only `id` since primary key is supported but dynamic primary key will be coming soon
- `.first()` Returns the first record
- `.join(tableName, <local key>, <remote key>)` Create joins between tables
- `.limit(5)` Limit the total results
- `.offset(10)` Defines the start of the search
- `.orderBy('fieldName' || {fieldName:" asc "})` Returns the ordered results
- `.select('column', 'column2')` Defines the columns of the database to extract
- `.update({field: 'value'}, where)` Update a record
- `.where({fieldName: 'value'})` Returns the results that match the expression

### Query Building

```js

Chat.all()

Chunk.count();

Chat.where({ messages : "blah" }).count();

Chat.create({ user_id: 23 })

User.find(1)

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
import { Model } from 'node-obremap'


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
import { Model } from 'node-obremap'


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

### CLI

By installing **node-obremap globally** (`npm install @moccacoders/node-obremap -g`) you can access CLI methods to help create models, connections, etc. and use the different creation wizards.
They are currently in **Spanish** and **English**.

#### Methods
- `obremap make:model <name> [options]` Create a new Obremap Model Class.
- `obremap make:connection <name> [options]` Create a new Database Connection
- `obremap make:migration <name> [options]` Create a new migration file
  - `obremap migrate [options]` Execute all migrations
  - `obremap migrate:reset [options]` Rollback all database migrations
  - `obremap migrate:refresh [options]` Reset and re-run all migrations
  - `obremap migrate:rollback [options]` Rollback the last database migration
  - `obremap migrate:refresh [options]` Drop all tables and re-run all migrations
- `obremap make:seeder <name> [options]` Create a new seeder file
  - `obremap seed [options]`

#### Models

`obremap make:model`

It will initialize the **Models** creation wizard which will guide you in creating your model, requesting the necessary information for it. Additionally, and only if necessary, it will display the connection creation wizard.
Creates a file in your current directory `/models/user.js` with a default model

#### Connections

`obremap make:connection`

It will initialize the **Connections** creation wizard which will ask you for the necessary information to create connections; It will also allow you to select between using the OBREMAP configuration file or your Environment Variables.

#### Migrations

`obremap make:migration` Create a migration file.


#### Seeders
`obremap make:seeder` Create a Seeder file.


### Everything
- Add more Database drivers
- CLI
  - Add more functions
  - Add more languages
- Migrations
