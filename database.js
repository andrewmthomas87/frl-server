var mysql = require('mysql')

var config = require('./config')

var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: config.mysqlPassword,
	database: 'frl'
})

connection.connect()

module.exports = connection
