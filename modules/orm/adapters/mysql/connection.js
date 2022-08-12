import mysql from "mysql";

function handleDisconnect() {
  let connection = mysql.createConnection(global.dbConn);
  return connection;
}

const connect = () => handleDisconnect();
const format = (...options) => mysql.format(...options);

export { connect, format };
