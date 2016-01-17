var config = require('../config')
var connection = require('../database')
var validator = require('../validator')

var SocketHandler = require('./SocketHandler')

function user(socket) {
	var userSocketHandler = SocketHandler(socket, 'User')

	userSocketHandler.register('get', function(id) {
		id = id || socket.decodedToken.id

		connection.query('select id, email, firstName, lastName, position, slack from users where users.id=?', [id], function(error, rows) {
			if (error) {
				userSocketHandler.error('get', 'Error fetching user')
				return
			}

			if (!rows.length) {
				userSocketHandler.error('get', 'Invalid user id')
				return
			}

			var user = rows[0]

			connection.query('select picture from userPictures where id=?', [id], function(error, rows) {
				if (error) {
					userSocketHandler.error('get', 'Server error')
					return
				}

				if (rows.length) {
					user.picture = rows[0]
				}
				else {
					user.picture = config.defaultPicture
				}
				userSocketHandler.send('get', user)
			})
		})
	})

	userSocketHandler.register('updateFirstName', function(firstName) {
		const valid = validator.firstName(firstName)

		if (valid === true) {
			connection.query('update users set firstName=? where id=?', [
				firstName,
				socket.decodedToken.id
			], function(error) {
				if (error) {
					userSocketHandler.error('updateFirstName', 'Server error')
					return
				}

				userSocketHandler.send('updateFirstName', 'Updated first name')
			})
		}
		else {
			userSocketHandler.error('updateFirstName', valid)
		}
	})
}

module.exports = user
