import mysql from 'mysql'

let connection

/* istanbul ignore next */
function handleDisconnect() {
	connection = mysql.createConnection(global.dbConn)

	connection.connect(err => {
		if(err) {
			console.error('error when connecting to db:', err)
			setTimeout(handleDisconnect, 2000);
		}
	})

	connection.on('error',err => {
		console.error('db error', err)
		if(err.code === 'PROTOCOL_CONNECTION_LOST') handleDisconnect()
			else throw err
		})
}

handleDisconnect()

export default connection;