import connection from './connection'
import QueryBuilder from './builders/query.builder'
import SchemaBuilder from './builders/schema.builder'
import FakerBuilder from './builders/faker.builder'
import { getTableName } from '../../../global/get-name'
import moment from 'moment';

class MysqlAdapter {

  /*
    Generic Adapter Methods (these should be in every adapter)
    select, create, queryBuilder, getJoins, makeRelatable
  /*


    Builds the mysql query, used query builder and root model class
  */
  select({ model, select, where, limit, joins = [], orderBy, offset, orWhere, toSql, sync, first }) {
    if(model.sync) sync = true;
    let joinsSQL = false;
    if(joins[0] === true){
      joinsSQL = true;
      joins.splice(0,1);
    }

    if(typeof orderBy == "object"){
      orderBy = Object.entries(orderBy).map((elem, ind) => {
        const [key, val] = elem;
        if(!isNumeric(key)) return `\`${key}\` ${val.toUpperCase()}`
        else return val
      });
    }
    if(typeof orderBy == "string") orderBy = [orderBy];
    
    if(orWhere && typeof orWhere == "object"){
      let newOrWhere = (orWhere[0]) ? orWhere : [orWhere];
      orWhere = [];

      newOrWhere.map(object => {
        if(typeof object == "object")
          Object.entries(object).map(obj => {
            let [key, val] = obj;
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<|like|in)/i);
            if(!operator) operator = ["="];
            val = `${val}`.replace(operator[0], "").replace(/ /i, "");
            if(val === "null" || val === null){
              val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
              operator[0] = "";
            }else{
              val = connection.async.escape(val);
            }
            orWhere.push(`${connection.async.escapeId(key)} ${operator[0]} ${val}`);
          })
        else orWhere.push(object)
      })

      orWhere = orWhere.join(" OR ");
    }

    if(where && typeof where == "object"){
      let newWhere = (where[0]) ? where : [where];
      where = [];

      newWhere.map(object => {
        if(typeof object == "object")
          Object.entries(object).map(obj => {
            let [key, val] = obj;
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<|like|in)/i);
            if(!operator) operator = ["="];
            val = `${val}`.replace(operator[0], "").replace(/ /i, "");
            if(val === "null" || val === null){
              val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
              operator[0] = "";
            }else{
              val = connection.async.escape(val);
            }
            where.push(`${connection.async.escapeId(key)} ${operator[0]} ${val}`);
          })
        else where.push(object)
      })

      where = where.join(" AND ")
    }

    const options = {
      sql: `SELECT ${select ? (sync ? this.selectSync(select, model.getTableName) : select) : (joins && sync ? this.joinsSelect(joins, model.getTableName) : '*')} FROM ${model.getTableName}${this.getJoins(joins, joinsSQL).join(" ")}${where ? ` WHERE ${where}` : ''}${orWhere ? `${!where ? " WHERE " : " OR "}${orWhere}` : ""}${orderBy ? ` ORDER BY ${orderBy.join(", ").replace(/asc/g, "ASC").replace(/desc/g, "DESC")}` : ''}${limit ? ` LIMIT ${offset ? `${offset},` : ""}${connection.async.escape(limit)}` : ''}`,
      nestTables: joins.length > 0 && joinsSQL
    }

    if(toSql) return options.sql;

    if(sync){
      let results = connection.sync.query(options.sql)
      if(joins.length > 0 && typeof joins == "object")
        results = this.mergeSyncJoins(results, joins, joinsSQL);
      if(/COUNT\(([\w]+)\)/.test(select))
        results = results[0].count;
      if(first == 1)
        results = results[0]

      return results;
    }

    return new Promise((resolve, reject) => {


      connection.async.query(options,  (error, results) => {
        if(error) return reject(error)

        if(/COUNT\(([\w]+)\)/.test(select)) resolve(results[0].count);
        if(joins.length > 0 && typeof joins == "object") results = this.mergeInJoins(results, joins, joinsSQL);
        resolve(this.makeRelatable(limit === 1 ? results[0] : results, model))
      })
    })
  }

  selectSync (select, originalTable) {
    let newSelect = [];
    let funct = null;
    if(typeof select == "string") select = [select];
    select.map(s => {
      s.split(/, ?/i).map(col => {
        let table = originalTable;
        let alias = null;

        if(col.search(/ as /i) >= 0) [col, alias] = col.split(/ as /i);
        if(col.search(/\./i) >= 0) [table, col] = col.split(".")
        if(col.search(/count\(([a-z0-9]+)\)/i) >= 0){
          col = col.replace(/count\(([a-z0-9]+)\)/i, `COUNT(\`${table}\`.\`$1\`)`);
          funct = true;
        }

        newSelect.push(`${!funct ? `\`${table}\`.` : ""}${col.search(/\`/i) >= 0 ? `${col}` : `\`${col}\``} AS ${table != originalTable ? `${table}_table_` : ""}${alias||col}`);
      })
    })
    return newSelect.join(", ");
  }

  joinsSelect(joins, originalTable) {
    let select = [];
    [{ includeTable:originalTable }, ...joins].map((join, ind) => {
      let table = join.includeTable;
      let tableName = null;
      if(join.includeTable.search(/ as /i) >= 0){
        table = join.includeTable.split(/ as /i)[1]
        tableName = join.includeTable.split(/ as /i)[0];
      }

      let columns = [];
      connection.sync.query(`SHOW COLUMNS FROM ${tableName || table}`).filter(column => {
        columns.push(`\`${table}\`.\`${column.Field}\` AS \`${ind != 0 ? `${table}_table_` : ""}${column.Field}\``);
      })
      select.push(columns);
    })
    return select.join(", ");
  }

  /*
    create a row in the database
  */

  create({ model, data }) {
    if(data.length == undefined) data = [data];
    let d = [];
    let v = [];
    data.map(item => {
      if(model.timestamps === true){
        if(model.createdAt && !item[model.createdAt]) item[model.createdAt] = model.currentDate;
        if(model.updatedAt && !item[model.updatedAt]) item[model.updatedAt] = model.currentDate;
      }
      let o = [];
      Object.entries(item).map(obj => {
        let [key, val] = obj;
        if(!v.includes(key))
          v.push(key);

        o.push(val);
      })
      d.push(o)
    })

    return new Promise((resolve, reject) => {
      connection.async.query(`INSERT INTO ${model.getTableName} (??) VALUES ?`, [v,d],  (error, result) => {
        if(error) return reject(error)
        resolve(this.makeRelatable({
          ...data,
          ...{id: result.insertId}
        }, model))
      })
    })
  }

  createSync({ model, data, timestamps, createdAt, updatedAt }) {
    if(data.length == undefined) data = [data];
    let d = [];
    let v = [];
    data.map(item => {
      timestamps = timestamps !== undefined ? timestamps : model.timestamps;
      createdAt = createdAt !== undefined ? createdAt : model.createdAt;
      updatedAt = updatedAt !== undefined ? updatedAt : model.updatedAt;

      if(timestamps === true){
        if(createdAt && !item[createdAt]) item[createdAt] = model.currentDate;
        if(updatedAt && !item[updatedAt]) item[updatedAt] = model.currentDate;
      }

      let o = [];
      Object.entries(item).map(obj => {
        let [key, val] = obj;
        if(!v.includes(key))
          v.push(key);

        o.push(val);
      })
      d.push(o)
    })
    let sql = connection.async.format(`INSERT INTO ${model.getTableName} (??) VALUES ?`, [v,d]);
    let results = connection.sync.query(sql)
    let result = this.makeRelatable({
      ...data,
      ...{id: results.insertId}
    }, model)
    return result;
  }

  /*
    update a row in the database
  */
  update({ model, data, id, where }) {
    if(typeof id != "object" && id != undefined)
      where = { id };

    if(model.timestamps === true){
      if(!data[model.updatedAt]) data[model.updatedAt] = model.currentDate;
    }

    let idName = `${data[`${model.getTableName}.id`] ? `${model.getTableName}.` : ""}id`
    if(data[idName] != undefined){
      if(!where) where = {};
      where[idName] = data[idName];
      delete data[idName];
    }

    if(where && typeof where == "object"){
      let newWhere = (where[0]) ? where : [where];
      where = [];

      newWhere.map(object => {
        if(typeof object == "object")
          Object.entries(object).map(obj => {
            let [key, val] = obj;
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<|like|in)/i);
            if(!operator) operator = ["="];
            val = `${val}`.replace(operator[0], "").replace(/ /i, "");
            if(val === "null" || val === null){
              val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
              operator[0] = "";
            }else{
              val = connection.async.escape(val);
            }
            where.push(`${connection.async.escapeId(key)} ${operator[0]} ${val}`);
          })
        else where.push(object)
      })
      where = where.join(" AND ")
    }

    if(model.sync) return this.updateSync({ model, data, id, where })
    return new Promise((resolve, reject) => {
      if(where == undefined || !where || where == "") throw new Error("Missing 'id' value or where object. [integer, object]");
      connection.async.query(`UPDATE ${model.getTableName} SET ? WHERE ${where}`, data, (error, result) => {
        if(error) return reject(error);
        connection.async.query(`SELECT * FROM ${model.getTableName} WHERE ${where}`, (error, res) => {
          resolve(this.makeRelatable({
            ...res[0]
          }, model))
        });
      })
    })
  }

  updateSync({ model, data, id, where }) {
    if(typeof id != "object" && id != undefined)
      where = { id };

    if(model.timestamps === true){
      if(!data[model.updatedAt]) data[model.updatedAt] = model.currentDate;
    }

    let idName = `${data[`${model.getTableName}.id`] ? `${model.getTableName}.` : ""}id`
    if(data[idName] != undefined){
      if(!where) where = {};
      where[idName] = data[idName];
      delete data[idName];
    }

    if(where && typeof where == "object"){
      let newWhere = (where[0]) ? where : [where];
      where = [];

      newWhere.map(object => {
        if(typeof object == "object")
          Object.entries(object).map(obj => {
            let [key, val] = obj;
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<|like|in)/i);
            if(!operator) operator = ["="];
            val = `${val}`.replace(operator[0], "").replace(/ /i, "");
            if(val === "null" || val === null){
              val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
              operator[0] = "";
            }else{
              val = connection.async.escape(val);
            }
            where.push(`${connection.async.escapeId(key)} ${operator[0]} ${val}`);
          })
        else where.push(object)
      })
      where = where.join(" AND ")
    }

    let queryValues = [];
    Object.entries(data).map(obj => {
      let [key, value] = obj;
      if(value && value.constructor && value.constructor.name == "Date") value = moment(value).format(model.getDateFormat());
      queryValues.push(`\`${model.getTableName}\`.\`${key}\` = ${connection.async.escape(value)}`);
    });

    if(where == undefined || !where || where == "") throw new Error("Missing 'id' value or where object. [integer, object]");
    let result = connection.sync.query(`UPDATE ${model.getTableName} SET ${queryValues.join(", ")} WHERE ${where}`);
    if(result.affectedRows > 0){
      let res = connection.sync.query(`SELECT * FROM ${model.getTableName} WHERE ${where}`);
      return this.makeRelatable({
        ...res[0]
      }, model)
    }


    // return new Promise((resolve, reject) => {
    //   if(id == undefined || !id) return reject(new Error("Missing 'id' value or where object. [integer, object]"));
    //   connection.async.query(`UPDATE ${model.getTableName} SET ? WHERE ${where}`, data, (error, result) => {
    //     if(error) return reject(error);
    //     connection.async.query(`SELECT * FROM ${model.getTableName} WHERE ${where}`, (error, res) => {
    //       resolve(this.makeRelatable({
    //         ...res[0]
    //       }, model))
    //     });
    //   })
    // })
  }

  /*
    sql
  */

  sql({ sql, values, sync = false }) {
    const options = {
      sql : connection.async.format(sql, values),
      nestTables: true
    }

    if(sync){
      let results = connection.sync.query(options.sql)
      return results;
    }

    return new Promise((resolve, reject) => {
      connection.async.query(options,  (error, results) => {
        if(error) return reject(error)
        resolve(results)

        // if(/COUNT\(([\w]+)\)/.test(select)) resolve(results[0].count);
        // if(joins.length > 0 && typeof joins == "object") results = this.mergeInJoins(results, joins, joinsSQL);
        // resolve(this.makeRelatable(limit === 1 ? results[0] : results, model))
      })
    })
  }


  /*
    delete a row in the database
  */
  delete({ model, id, where }) {
    if(typeof id != "object" && id != undefined)
      where = { id };

    if(where && typeof where == "object"){
      let newWhere = (where[0]) ? where : [where];
      where = [];

      newWhere.map(object => {
        if(typeof object == "object")
          Object.entries(object).map(obj => {
            let [key, val] = obj;
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<|like|in)/i);
            if(!operator) operator = ["="];
            val = `${val}`.replace(operator[0], "").replace(/ /i, "");
            if(val === "null" || val === null){
              val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
              operator[0] = "";
            }else{
              val = connection.async.escape(val);
            }
            where.push(`${connection.async.escapeId(key)} ${operator[0]} ${val}`);
          })
        else where.push(object)
      })
      where = where.join(" AND ")
    }

    if(model.sync) return this.deleteSync({ model, id, where })
    return new Promise((resolve, reject) => {
      if(!where) return reject(new Error("Missing 'id' value or where object. [integer, object]"));
      connection.async.query(`DELETE FROM ${model.getTableName} WHERE ${where}`, (error, result) => {
        if(error) return reject(error);
        resolve(result, model);
      })
    })
  }

  deleteSync({ model, id, where }) {
    if(typeof id != "object" && id != undefined)
      where = { id };

    if(where && typeof where == "object"){
      let newWhere = (where[0]) ? where : [where];
      where = [];

      newWhere.map(object => {
        if(typeof object == "object")
          Object.entries(object).map(obj => {
            let [key, val] = obj;
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<|like|in)/i);
            if(!operator) operator = ["="];
            val = `${val}`.replace(operator[0], "").replace(/ /i, "");
            if(val === "null" || val === null){
              val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
              operator[0] = "";
            }else{
              val = connection.async.escape(val);
            }
            where.push(`${connection.async.escapeId(key)} ${operator[0]} ${val}`);
          })
        else where.push(object)
      })
      where = where.join(" AND ")
    }

    if(!where) throw new Error("Missing 'id' value or where object. [integer, object]");
    let result = connection.sync.query(`DELETE FROM ${model.getTableName} WHERE ${where}`);
    return result;
  }


  /*
    returns a new query builder instance
  */
  queryBuilder(options) {
    return new QueryBuilder(options)
  }

  /*
    returns a new schema builder instance
  */
  schemaBuilder(options) {
    return new SchemaBuilder(options)
  }

  /*
    returns a new faker builder instance
  */
  fakerBuilder(options) {
    return new FakerBuilder(options)
  }

  /*
    creates join query from any model realtionships
    used on eager loads
  */
  getJoins(joins, joinsSQL) {
    if(typeof joins == "object" && !joinsSQL) return [];
    return joins.map(join => {
      let split = join.includeTable.split(" as ");
      return ` ${join.type} JOIN \`${split[0]}\`${(split[1]) ? ` AS ${split[1]}` : ''} ON ${join.localField} ${join.operator} ${join.remoteField}`;
    })
  }


  /*
    Proxy object that returns item from resulting query
    or will check for a relationship on the model
    and return a promise.

    ex
    result.id -> returns `id` on the result Object

    result.users
      -> returns users if extists on the object.
         otherwise, checks for `users` function on the
         model and returns the related query promise
  */

  makeRelatable(result, model) {
    return new Proxy(result, {
      get(target, name) {
        if(name in target && target[name] != null) return target[name]
        if(getTableName(name, model.snakeCase) in target) return target[getTableName(name, model.snakeCase)]

        let instance = new model(result)
        if(name in instance) return instance[name]().result()
      }
    })
  }

  /*
    MYSQL SPECIFIC METHODS
  */


  /*
    Joins nested tables for when eager loading a relationship

    converts
    {
      users: { name: 'Bob'},
      chats: {...},
    }
    to
    {
      name: 'Bob',
      chats: {...}
    }
  */
  mergeInJoins(results, joins, joinsSQL) {
    let response = [];
    results.map((result, ind) => {
      let newResult = {};
      Object.keys(result).forEach((item, index) => {
        if(index==0) return newResult = result[item]

        // if(typeof joins == "object" && !joinsSQL){
        //   Object.entries(joins).map(obj => {
        //     let [key, val] = obj;
        //     let localFieldSplit = val.localField.split(".");
        //     let localField = localFieldSplit[localFieldSplit.length - 1];
        //     newResult[key] = val.result({[val.localField] : newResult[localField]});
        //   });
        // }
        
        newResult[item] = result[item]
      })
      response[ind] = newResult
    })
    return response;
  }

  mergeSyncJoins (results, joins, joinsSQL) {
    let response = [];
    results.map(result => {
      let obj = {};
      Object.entries(result).map(object => {
        let [key, value] = object;
        if(key.search(/_table_/i) >= 0){
          let match = key.split(/_table_/i);
          if(!obj[match[0]] || typeof obj[match[0]] != "object") obj[match[0]] = {};
          obj[match[0]][match[1]] = value;
        }
        else
          obj[key] = value;
      })
      response.push(obj);
    })
    
    return response;
  }

  createTable ({ options, model, fields, alterTables, engine, charset, collation }) {
    fields = this.processFields(fields).join(", ");
    let sql = `create table \`${model.tableName}\` (${fields}) default character set ${charset} collate '${collation}' engine = ${engine}`;
    sql = connection.async.format(sql);
    return connection.sync.query(sql);
  }

  alterTable ({ options, model, fields, alterTables, engine, charset, collation, drop, column }) {
    fields = this.processFields(fields).join(", ");
    if(drop) fields = `\`${column}\``;
    let sql = `alter table \`${model.tableName}\` ${drop ? "drop" : "add"} column ${fields}`;
    sql = connection.async.format(sql);
    return connection.sync.query(sql);
  }

  dropTable ({ options, model }) {
    let sql = `drop table ${options.ifExists === true ? "if exists " : ""}\`${model.tableName}\``;
    sql = connection.async.format(sql);
    return connection.sync.query(sql);
  }

  dropColumn ({ model, column }) {
    let sql = `alter table ${model.tableName} drop column \`${column}\``;
    // console.log(model, column)
    return true;
  }

  truncateTable (model) {
    let sql = `truncate table \`${model.tableName}\``;
    sql = connection.async.format(sql);
    return connection.sync.query(sql);
  }


  processFields(fields){
    let uniques = [];
    let primaries = [];
    fields = fields.map(field => {
      if(field.primary) primaries.push(`\`${field.name}\``);
      if(field.unique) uniques.push(`\`${field.name}\``);

      let str = [];
      str.push(`\`${field.name}\` ${field.type}`);
      if(field.length && field.length > 0) str.push(`(${field.length})`);
      if(field.unsigned) str.push("unsigned");
      if(field.nullable) str.push("null");
      else str.push("not null");
      if(field.auto_increment) str.push("auto_increment");
      if(field.default) str.push(`default ${["CURRENT_TIMESTAMP", "GETDATE()"].includes(field.default) ? field.default : `'${field.default}'`}`);
      if(field.comment) str.push(`comment '${field.comment}'`);
      if(field.after) str.push(`after \`${field.after}\``);
      
      return str.join(" ").trim();
    })

    if(uniques.length > 0) fields.push(`unique (${uniques.join(", ")})`);
    if(primaries.length > 0) fields.push(`primary key (${primaries.join(", ")})`);
    return fields;
  }


  validateMigrations () {
    return new Promise((resolve, reject) => {
      connection.async.query(`SHOW TABLES`,  (error, results) => {
        if(error) return reject(error)
      })
    })
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default new MysqlAdapter()
