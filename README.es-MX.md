# OBREMAP - Node ORM

![example workflow name](https://github.com/moccacoders/node-obremap/workflows/Run%20Tests%20and%20Coveralls/badge.svg?branch=master)
![Coverage Status](https://coveralls.io/repos/github/moccacoders/node-obremap/badge.svg?branch=master)
[![npm version](https://badge.fury.io/js/%40moccacoders%2Fnode-obremap.svg)](https://badge.fury.io/js/%40moccacoders%2Fnode-obremap)

**OBREMAP Node ORM** es una herramienta de Mapeo Objeto-Relacional para Node JS basada en el famoso ORM de [Laravel](https://laravel.com/), [**Eloquent**](https://laravel.com/docs/eloquent).
OBREMAP proporciona una implementación de ActiveRecord hermosa y simple para trabajar con su base de datos. Cada tabla de base de datos tiene un **"Modelo OBREMAP"** correspondiente que se utiliza para interactuar con esa tabla.
Los modelos le permiten consultar datos en sus tablas, así como insertar nuevos registros en la tabla.

Antes de comenzar, asegurate de configurar tus bases de datos correctamente. para más información sobre la configuración de la base de datos, consulta la [configuración de base de datos](#database-configuration).

## ¿CÓMO INSTALAR?

```
$ npm install @moccacoders/node-obremap --save
or
$ yarn add @moccacoders/node-obremap

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
La configuración es similar a lo visto anteriormente.

#### -> VARIABLES DE ENTORNO

Para configurar multiples conexiones por medio de las variables de entorno **OBREMAP Node ORM** toma todas las varibles que tengan como prefijo `DB_` y asigna el valor siguiente como variable de configuración. Por lo que si colocas `DB_HOST` esta será la variable de configuración principal (`default`) que contiene el hostname de la base de datos. Sin embargo, si colocas un identificador despues del prefijo `DB_`, este será tomado como nombre de conexión, a este debe seguir el nombre de la variable de conexión, ejemplo: `DB_LOCAL_HOST` para este caso el nombre de la conexión será `local` y la variable de conexión será `host`.

```json
// CONEXIÓN PRINCIPAL
DB_DRIVER=mysql
DB_HOST=127.0.0.1
DB_USERNAME=user
DB_PASSWORD=pass
DB_NAME=database_name

// CONEXIÓN SECUNDARIA [LOCAL]
DB_LOCAL_DRIVER=mysql
DB_LOCAL_HOST=localhost
DB_LOCAL_USERNAME=loca_user
DB_LOCAL_PASSWORD=local_pass
DB_LOCAL_NAME=other_database

```

#### -> ARCHIVO DE CONFIGURACIÓN OBREMAP

Así como se puede configurar multiples conexión a la base de datos con una pequeña modificación en las varibles de entorno también lo puedes hacer mediante el **archivo de configuración OBREMAP** lo unico que tendrás que hacer es agregar un elemento más a tu objecto `databases`, tomando en consideración que el nombre que le des al objeto nuevo, será el nombre de tu conexión.

```js
module.exports = {
  databases : {
    // CONEXIÓN PRINCIPAL
    default : "mysql://root:password@127.0.0.1/database_name",
    // CONEXIÓN SECUNDARIA [LOCAL]
    local : "mysql://loca_user:local_pass@localhost/other_database"
  }
}
```

#### SELECCIONAR BASE DE DATOS

Una vez que ya haz configurados tus multiples bases de datos lo que deberás hacer es indicar al model que conexión debe utilizar. Y esto se hace solamente agregando un methodo estatico dentro de tu modelo. Recuerda que el nombre que coloques aquí es el nombre que le diste a tu conexión en la configuración de conexión de bases de datos multiples. 

```js
import { Model } from 'node-obremap'

export default class Chat extends Model {
  static conexion = "local";
}
```

### DEFINIR UN MODELO

Para comenzar, crearemos un **Modelo Obremap**. Por lo general los modelos se encuentran en la carpeta raiz dentro de la carpeta **MODELS** sin embargo puedes colocarlos donde prefieras, siempre y cuando puedas acceder a ellos. Todos los **Modelos OBREMAP** deben extender de la clase `Model` dentro de **node-obremap**.
La forma más sencilla para crear tus modelos es utilizando el **Obremap CLI** con la funcion `obremap make:model`

`chat.js`

```js
import { Model } from 'node-obremap'

export default class Chat extends Model {
  /*
    overwrite table name, this is optional
    static tableName = 'dashboard_chats';
  */
}

```

### USANDO EL MODELO

Una vez creado el **Modelo OBREMAP** (y asociada la tabla de base de datos correctamente), estará listo para obtener datos de sus bases de datos. Piensa en los Modelos OBREMAP como generadores de consultas eficientes que te ayudarán a realizar tus consultas con rápidez a la base de datos asociada a tus Modelos.
Ejemplo:

```js
import Chat from './chat'

async function getChats {
  let chats = await Chat.all()
  console.log(chats)
}
```

#### Metodos Soportados

- `.all()` Regresa todo en la table
- `.count()` Regresa un valor numerico correspondiente al total de registros extraidos
- `.create({ field: 'value'})` Crear un nuevo registro
- `.delete(where||<primary key>)` Elimina el registro
- `.find(<primary key>)` Encuentra y devuelve una relación actualmente solo `id` ya que la clave primaria es compatible pero la clave primaria dinámica llegará pronto
- `.first()` Regresa el primer registro
- `.join(tableName, <local key>, <remote key>)` Crear uniones entre tablas
- `.limit(5)` Limita el total de resultados
- `.offset(10)` Define el inicio de la búsqueda
- `.orderBy('fieldName' || {fieldName : "asc"})` Regresa los resulstados ordenados
- `.select('column', 'column2')` Define las columnas de la base de datos a extraer
- `.update({ field: 'value' }, where)` Actualiza un registro
- `.where({ fieldName: 'value' })` Regresa los resultados que coincidan con la expresión

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

### RELACIONES

Esta es una gran WIP, no dude en contribuir

Soporta:
- Uno to Uno
- Uno a muchos

Por Hacer:
- Muchos a Muchos
- Tiene muchos a través
- Relaciones polimórficas
- Relaciones polimórficas de muchos a muchos

#### Uno to Uno - Ejemplo

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

#### Uno a muchos - Ejemplo

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

Si instala **node-obremap globalmente** (`npm install @moccacoders/node-obremap -g`) puede acceder a los métodos CLI para ayudar a crear modelos, conexiones, etc. y utilizar los diferentes asistentes de creación.
Actualmente se encuentran en **español** e **ingles**.

#### Models

`obremap make:model`

Inicializará el asistente de creación de **Modelos** el cual te guiará en la creación de tu modelo solicitandote información necesaria para ello. Adicionalemnte, y solo si es necesario, te desplegará el asistente de creación de conexiones.
Creates a file in your current directory `/models/user.js` with a default model

#### Conexiones

`obremap make:connection`

Inicializará le asistente de creación de **Conexiones** el cual te solicitará la información necesaria para le creación de conexiones; así mismo te permitirá seleccionar entre utilizar el archivo de configuración OBREMAP o bien tus Variables de Entorno.


### Todo
- Agregar más controladores de Bases de Datos
- CLI
  - Agregar más funciones
  - Agregar más lenguajes
- Migraciones
