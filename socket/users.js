var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function users(io, socket) {
	var usersSocketHandler = SocketHandler(io, socket, 'Users')

	usersSocketHandler.register('get', function() {
		connection.query('select id, concat(firstName, " ", lastName) name from users', function(error, rows) {
			if (error) {
				usersSocketHandler.error('get', 'Error fetching users')
				return
			}

			usersSocketHandler.send('get', rows)
		})
	})

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
