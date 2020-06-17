import connection from './connection'
import Builder from './builder'
import { getTableName } from '../../../global/get-name'


class MysqlAdapter {

  /*
    Generic Adapter Methods (these should be in every adapter)
    select, create, queryBuilder, getJoins, makeRelatable
  /*


    Builds the mysql query, used query builder and root model class
  */
  select({ model, select, where, limit, joins = [], orderBy, offset }) {
    if(typeof orderBy == "object"){
      orderBy = Object.entries(orderBy).map((elem, ind) => {
        const [key, val] = elem;
        if(!isNumeric(key)) return `\`${key}\` ${val.toUpperCase()}`
        else return val
      });
    }
    if(typeof orderBy == "string") orderBy = [orderBy];
    return new Promise((resolve, reject) => {
      const options = {
        sql: `SELECT ${select ? select : '*'} FROM ${model.getTableName}${this.getJoins(joins).join(" ")}${where ? ` WHERE ${connection.escape(where)}` : ''}${orderBy ? ` ORDER BY ${orderBy.join(", ").replace(/asc/g, "ASC").replace(/desc/g, "DESC")}` : ''}${limit ? ` LIMIT ${offset ? `${offset},` : ""}${connection.escape(limit)}` : ''}`,
        nestTables: joins.length > 0 ? true : false
      }


      connection.query(options,  (error, results) => {
        if(error) return reject(error)

        if(/COUNT\(([\w]+)\)/.test(select)) resolve(results[0].count);
        if(joins.length > 0) results = this.mergeInJoins(results)
        resolve(this.makeRelatable(limit === 1 ? results[0] : results, model))
      })
    })
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
      connection.query(`INSERT INTO ${model.getTableName} SET ?`, data,  (error, result) => {
        if(error) return reject(error)
        resolve(this.makeRelatable({
          id: result.insertId,
          ...data
        }, model))
      })
    })
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
      connection.query(`UPDATE ${model.getTableName} SET ? WHERE ${where}`, data, (error, result) => {
        if(error) return reject(error);
        connection.query(`SELECT * FROM ${model.getTableName} WHERE ${where}`, (error, res) => {
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
      connection.query(`DELETE FROM ${model.getTableName} WHERE ${where}`, (error, result) => {
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
  getJoins(joins) {
    return joins.map(join => {
      let split = join.includeTable.split(" as ");
      return ` ${join.type || "INNER"} JOIN \`${split[0]}\`${(split[1]) ? ` AS ${split[1]}` : ''} ON ${join.localField} ${join.operator || "="} ${join.remoteField}`
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
  mergeInJoins(results) {
    return results.map(result => {
      let newResult = {}
      Object.keys(result).forEach((item, index) => {
        if(index === 0) newResult = result[item]
        else newResult[item] = result[item]
      })
      return newResult
    })
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default new MysqlAdapter()
