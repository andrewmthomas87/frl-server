var validationUtility = require('validator')

var bcrypt = require('bcrypt')

var config = require('../config')
var connection = require('../database')
var validator = require('../validator')

var SocketHandler = require('./SocketHandler')

function user(io, socket) {
	var userSocketHandler = SocketHandler(io, socket, 'User')

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
				userSocketHandler.update(firstName, 'UserUpdate.firstName')
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
				userSocketHandler.update(lastName, 'UserUpdate.lastName')
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
				userSocketHandler.update(email, 'UserUpdate.email')
			})
		}
		else {
			userSocketHandler.error('updateEmail', valid)
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
				userSocketHandler.update(slack, 'UserUpdate.slack')
			})
		}
		else {
			userSocketHandler.error('updateSlack', valid)
		}
	})

	userSocketHandler.register('updatePassword', function(passwords) {
		var currentPassword = passwords.currentPassword.trim()
		var newPassword = passwords.newPassword.trim()
		var confirmPassword = passwords.confirmPassword.trim()

		if (!(currentPassword && newPassword && confirmPassword)) {
			userSocketHandler.error('updatePassword', 'Invalid inputs')
			return
		}

		connection.query('select password from users where id=?', [socket.decodedToken.id], function(error, rows) {
			bcrypt.compare(currentPassword, rows[0].password, function(error, result) {
				if (error) {
					userSocketHandler.error('updatePassword', 'Server error')
					return
				}

				if (result) {
					if (newPassword === confirmPassword) {
						const valid = validator.password(newPassword)

						if (valid === true) {
							bcrypt.hash(newPassword, 8, function(error, hash) {
								if (error) {
									userSocketHandler.error('updatePassword', 'Server error')
									return
								}

								connection.query('update users set password=? where id=?', [hash, socket.decodedToken.id], function(error) {
									if (error) {
										userSocketHandler.error('updatePassword', 'Server error')
										return
									}

									userSocketHandler.send('updatePassword', 'Updated password')
								})
							})
						}
						else {
							userSocketHandler.error('updatePassword', valid)
						}
					}
					else {
						userSocketHandler.error('updatePassword', 'Passwords do not match')
					}
				}
				else {
					userSocketHandler.error('updatePassword', 'Invalid password')
				}
			})
		})

	})

}

module.exports = user
