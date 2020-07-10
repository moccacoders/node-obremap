require('dotenv').config();

module.exports = {
	"config": "test",
	"databases": {
		"default": process.env.DATABASE_URL_OTHER,
		"test": {
			"host" : process.env.DB_HOST,
			"user" : process.env.DB_USERNAME,
			"password" : process.env.DB_PASSWORD,
			"database" : process.env.DB_NAME,
			"driver" : process.env.DB_DRIVER
		}
	}
}
