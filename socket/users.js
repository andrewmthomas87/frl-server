var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function users(socket) {
	var usersSocketHandler = SocketHandler(socket, 'Users')

	usersSocketHandler.register('get', function() {
		connection.query('select id, firstName, lastName from users', function(error, rows) {
			if (error) {
				usersSocketHandler.error('get', 'Error fetching users')
				return
			}

			usersSocketHandler.send('get', rows.map(function(row) {
				return {
					id: row.id,
					name: row.firstName + ' ' + row.lastName
				}
			}))
		})
	})
}

module.exports = users
