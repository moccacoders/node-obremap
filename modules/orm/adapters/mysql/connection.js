import mysql from 'mysql'
import SyncMysql from 'sync-mysql'

let connection = {};

/* istanbul ignore next */
function handleDisconnect() {
	connection.async = mysql.createConnection(global.dbConn)
	connection.sync = new SyncMysql(global.dbConn);

	connection.async.connect(err => {
		if(err) {
			console.error('error when connecting to db:', err)
			setTimeout(handleDisconnect, 2000);
		}
	})

	connection.async.on('error',err => {
		console.error('db error', err)
		if(err.code === 'PROTOCOL_CONNECTION_LOST') handleDisconnect()
		else throw err
	})
}

handleDisconnect()

export default connection;