module.exports = {
	"config": "test",
	"databases": {
		"default": "mysql://root:root@127.0.0.1/node-orm",
		"test": {
			"host": "127.0.0.1",
			"user": "root",
			"password": "root",
			"database": "node-orm",
			"port": "3306",
			"driver": "mysql"
		}
	}
}