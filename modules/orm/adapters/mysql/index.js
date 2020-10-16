import connection from './connection'
import Builder from './builder'
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
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<)/i);
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
            let operator = `${val}`.match(/(=|!=|<=>|<>|>=|>|<=|<)/i);
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
    if(model.timestamps === true){
      if(model.createdAt && !data[model.createdAt]) data[model.createdAt] = model.currentDate;
      if(model.updatedAt && !data[model.updatedAt]) data[model.updatedAt] = model.currentDate;
    }

    return new Promise((resolve, reject) => {
      connection.async.query(`INSERT INTO ${model.getTableName} SET ?`, data,  (error, result) => {
        if(error) return reject(error)
        resolve(this.makeRelatable({
          id: result.insertId,
          ...data
        }, model))
      })
    })
  }

  createSync({ model, data }) {
    if(model.timestamps === true){
      if(model.createdAt && !data[model.createdAt]) data[model.createdAt] = model.currentDate;
      if(model.updatedAt && !data[model.updatedAt]) data[model.updatedAt] = model.currentDate;
    }

    let queryValues = [];
    Object.entries(data).map(obj => {
      let [key, value] = obj;
      if(value.constructor.name == "Date") value = moment(value).format(model.getDateFormat());
      queryValues.push(`\`${model.getTableName}\`.\`${key}\` = '${value}'`);
    });

    let query = `INSERT INTO ${model.getTableName} SET ${queryValues.join(", ")}`;
    let results = connection.sync.query(query)
    let result = this.makeRelatable({
      id: results.insertId,
      ...data
    }, model)
    return result;
  }

  /*
    update a row in the database
  */
  update({ model, data, id, where }) {
    if(where) id = where;
    where = "";
    if(data.id != undefined){
      if(!id) id = data.id;
      delete data.id;
    }

    if(typeof id != "object" && id != undefined) id = { id };
    if(id != undefined){
      where = Object.entries(id).map((data,i) => {
        const [key, value] = data;
        return `${key} = '${value}'`
      }).join(" AND ");
    }

    return new Promise((resolve, reject) => {
      if(id == undefined || !id) return reject(new Error("Missing 'id' value or where object. [integer, object]"));
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

  /*
    count rows
  */


  /*
    delete a row in the database
  */
  delete({ model, id }) {
    let where = "";

    if(typeof id != "object" && id != undefined) id = { id };
    if(id != undefined){
      where = Object.entries(id).map((data,i) => {
        const [key, value] = data;
        return `${key} = '${value}'`
      }).join(" AND ");
    }

    return new Promise((resolve, reject) => {
      if(id == undefined || !id) return reject(new Error("Missing 'id' value or where object. [integer, object]"));
      connection.async.query(`DELETE FROM ${model.getTableName} WHERE ${where}`, (error, result) => {
        if(error) return reject(error);
        resolve(result, model);
      })
    })
  }

  /*
    returns a new query builder instance
  */
  queryBuilder(options) {
    return new Builder(options)
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
        if(name in target) return target[name]
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
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default new MysqlAdapter()
