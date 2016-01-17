var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function users(socket) {
	var usersSocketHandler = SocketHandler(socket, 'Users')

	usersSocketHandler.register('getSearchables', function() {
		connection.query('select id "key", concat(firstName, " ", lastName) name from users where id<>?', [socket.decodedToken.id], function(error, rows) {
			if (error) {
				usersSocketHandler.error('getSearchables', 'Error fetching users')
				return
			}

			usersSocketHandler.send('getSearchables', rows)
		})
	})
}

module.exports = users
