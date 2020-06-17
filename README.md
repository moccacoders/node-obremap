# OBREMAP - Node ORM

**OBREMAP Node ORM** es una herramienta de Mapeo Objeto-Relacional para Node JS. OBREMAP proporciona una implementación de ActiveRecord hermosa y simple para trabajar con su base de datos. Cada tabla de base de datos tiene un "Modelo" correspondiente que se utiliza para interactuar con esa tabla. Los modelos le permiten consultar datos en sus tablas, así como insertar nuevos registros en la tabla.

Antes de comenzar, asegurate de configurar tus bases de datos correctamente. para más información sobre la configuración de la base de datos, consulta la [configuración de base de datos](#database-configuration).

## ¿CÓMO INSTALAR?

```
$ npm install @moccacoders/node-eloquent --save
or
$ yarn add @moccacoders/node-eloquent

//if using mysql driver this is peer dependency anyway
npm install mysql --save
```

## <a name="database-configuration">CONFIGURACIÓN DE BASE DE DATOS</a>

Con **OBREMAP Node ORM** tienes dos formas con las que puedes configurar tus bases de datos. La primera es agregando tus bases de datos a las variables de entorno de tu app y la segunda (más recomendable) utilizando el archivo de configuración `obremap.config.js`.

#### -> Variables de Entorno

Para configurar tus bases de datos deberás definir las siguientes variables:
```
DB_DRIVER=mysql
DB_HOST=localhost
DB_USERNAME=user
DB_PASSWORD=pass
DB_NAME=database_name
```

#### -> Archivo de Configuración OBREMAP

Si bien es muy sencillo configurar tus bases de datos solo agregando las variables de entorno necesarias, te recomendamos que utilices el **archivo de configuración OBREMAP**, este te permitirá configurar tus bases de datos de manera independiente.
Lo que deberás hacer es crear un archivo con el nombre `obremap.config.js` en la carpeta raiz de tu aplicación y agregar la siguiente configuración básica.

* Es importante agregar la llave `default` a la configuración de bases de datos, ya que esta será la información principal que se utilizará para la conexión

```js
module.exports = {
  databases : {
    default : { // IMPORTANTE AGREGAR "DEFAULT". ESTA SERÁ LA INFORMACIÓN DE CONEXIÓN PRINCIPAL
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

### Configuración usando URL's
Comunmente, la configuración de las bases de datos utilizan multiples valores de configuración como `host`, `database`, `username`, `password`, etc. Cada uno de ellos corresponde a una variable de entorno. Esto quiere decir que cuando configuras tus bases de datos en tu servidor de producción, deberás manejar muchas variables de entorno.

Muchos de los proveedores de bases de datos proveen una única "URL" de conexión a base de datos, la cual contiene toda la información necesaria para la conexión en una simple cadena. Un ejemplo de URL de dase de datos se ve muy similiar a esto:

```php
mysql://root:password@127.0.0.1/forge?charset=UTF-8
```

Estas URLs suelen seguir una convención de esquema estándar:

```php
driver://username:password@host:port/database?options
```

Para tu conveniencia, **OBREMAP Node ORM** admite estas URLs como una alternativa a la configuración de sus bases de datos con múltiples opciones de configuración. Es decir, si se encuentra presenta una URL de configuración de base de datos (o su correspondiente variable de entorno `DATABASE_URL`) se utilizará para extraer la conexión de la base de datos y la información de credenciales.

##### -> VARIABLES DE ENTORNO
```
DATABASE_URL=mysql://root:password@127.0.0.1/database_name
```

##### -> ARCHIVO DE CONFIGURACIÓN OBREMAP
La configuración es similar a la anterior. Solo que en lugar de guardar un objeto dentro de la configuración default, deberás agregar la URL como cadena.
```js
module.exports = {
  databases : {
    default : "mysql://root:password@127.0.0.1/database_name"
  }
}
````

### Configuración de multiples bases de datos

**OBREMAP Node ORM** provee la posibilidad de realizar multiples conexiones a multiples bases de datos. No tienes límite en cuanto a conexiones, puedes configurar todas las conexiones que necesites, todas las bases de datos que requieras.


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


### Todo
- more drivers
- migrations support
- more cli tools

Node Eloquent is a fork of another project by [Zach Silveira](https://github.com/zackify) Done under [Construction Jobs
](https://github.com/ConstructionJobs). [Relation](https://github.com/ConstructionJobs/relation) is the original package which takes inspiration from knex and sequelize, but the end goal is to completely mimic Laravel's Eloquent package. In order to achieve the best syntax possible, we are using ES6 Proxies, which is now supported in the latest version of node. Currently, only mysql is supported, but adding a new driver is trivial.
