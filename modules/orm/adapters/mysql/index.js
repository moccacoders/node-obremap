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
  select({ model, select, where, limit, joins = [], orderBy, offset, orWhere, toSql }) {
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
          let operator = `${val}`.match(/(=|!=|<=>|>=|>|<=|<|<>)/i);
          if(!operator) operator = ["="];
          val = `${val}`.replace(operator[0], "").replace(/ /i, "");
          if(val === "null" || val === null){
            val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
            operator[0] = "";
          }else{
            val = connection.escape(val);
          }
          orWhere.push(`${connection.escapeId(key)} ${operator[0]} ${val}`);
        })
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
          let operator = `${val}`.match(/(=|!=|<=>|>=|>|<=|<|<>)/i);
          if(!operator) operator = ["="];
          val = `${val}`.replace(operator[0], "").replace(/ /i, "");
          if(val === "null" || val === null){
            val = ["!=", "<>", "<=>"].includes(operator[0]) ? "IS NOT NULL" : "IS NULL";
            operator[0] = "";
          }else{
            val = connection.escape(val);
          }
          where.push(`${connection.escapeId(key)} ${operator[0]} ${val}`);
        })
      })

      where = where.join(" AND ")
    }


    return new Promise((resolve, reject) => {
      const options = {
        sql: `SELECT ${select ? select : '*'} FROM ${model.getTableName}${this.getJoins(joins, joinsSQL).join(" ")}${where ? ` WHERE ${where}` : ''}${orWhere ? `${!where ? " WHERE" : " OR "}${orWhere}` : ""}${orderBy ? ` ORDER BY ${orderBy.join(", ").replace(/asc/g, "ASC").replace(/desc/g, "DESC")}` : ''}${limit ? ` LIMIT ${offset ? `${offset},` : ""}${connection.escape(limit)}` : ''}`,
        nestTables: joins.length > 0 && joinsSQL
      }

      if(toSql) resolve(options.sql);

      connection.query(options,  (error, results) => {
        if(error) return reject(error)

        if(/COUNT\(([\w]+)\)/.test(select)) resolve(results[0] ? results[0].count : results.count ? results.count : null);
        if(joins.length > 0 && typeof joins == "object") results = this.mergeInJoins(results, joins, joinsSQL);
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
          }, model).get())
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
  getJoins(joins, joinsSQL) {
    if(typeof joins == "object" && !joinsSQL) return [];
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
    if(!result) return true;
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
  mergeInJoins(results, joins, joinsSQL = false) {
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
        
        if(joinsSQL) newResult[item] = result[item]
      })
      response[ind] = newResult
    })
    return response;
  }
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export default new MysqlAdapter()
