var validationUtility = require('validator')

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
		firstName = firstName || ''

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

	userSocketHandler.register('updateLastName', function(lastName) {
		lastName = lastName || ''

		const valid = validator.lastName(lastName)

		if (valid === true) {
			connection.query('update users set lastName=? where id=?', [
				lastName,
				socket.decodedToken.id
			], function(error) {
				if (error) {
					userSocketHandler.error('updateLastName', 'Server error')
					return
				}

				userSocketHandler.send('updateLastName', 'Updated last name')
			})
		}
		else {
			userSocketHandler.error('updateLastName', valid)
		}
	})

	userSocketHandler.register('updateEmail', function(email) {
		email = email || ''

		const valid = validator.email(email)

		email = validationUtility.normalizeEmail(email)

		if (valid === true) {
			connection.query('update users set email=? where id=?', [
				email,
				socket.decodedToken.id
			], function(error) {
				if (error) {
					userSocketHandler.error('updateEmail', 'Server error')
					return
				}

				userSocketHandler.send('updateEmail', 'Updated email')
			})
		}
		else {
			userSocketHandler.error('updateEmail', valid)
		}
	})

	userSocketHandler.register('updatePosition', function(position) {
		position = parseInt(position)

		const valid = validator.position(position)

		if (valid === true) {
			connection.query('update users set position=? where id=?', [
				position,
				socket.decodedToken.id
			], function(error) {
				if (error) {
					userSocketHandler.error('updatePosition', 'Server error')
					return
				}

				userSocketHandler.send('updatePosition', 'Updated position')
			})
		}
		else {
			userSocketHandler.error('updatePosition', valid)
		}
	})

	userSocketHandler.register('updateSlack', function(slack) {
		slack = slack || ''

		const valid = validator.slack(slack)

		if (valid === true) {
			if (slack === '') {
				slack = null
			}

			connection.query('update users set slack=? where id=?', [
				slack,
				socket.decodedToken.id
			], function(error) {
				if (error) {
					userSocketHandler.error('updateSlack', 'Server error')
					return
				}

				userSocketHandler.send('updateSlack', 'Updated slack')
			})
		}
		else {
			userSocketHandler.error('updateSlack', valid)
		}
	})

}

module.exports = user
