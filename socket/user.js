var config = require('../config')
var connection = require('../database')
var validator = require('../validator')

var SocketHandler = require('./SocketHandler')

function user(socket) {
	var userSocketHandler = SocketHandler(socket, 'User')

	userSocketHandler.register('get', function() {
		console.log(socket.decodedToken.id)
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
