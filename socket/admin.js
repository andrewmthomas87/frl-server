var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

var admins

connection.query('select id from users where admin=1', function(error, rows) {
	if (error) {
		rows = []
	}

	admins = rows.map(function(row) {
		return row.id
	})
})

function isAdmin(id) {
	return admins.indexOf(id) > -1
}

function admin(io, socket) {
	var adminSocketHandler = SocketHandler(io, socket, 'Admin')

	adminSocketHandler.register('verify', function() {
		if (isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.send('verify', 'Access granted')
		}
		else {
			adminSocketHandler.error('verify', 'Access denied')
		}
	})

	adminSocketHandler.register('generateDraft', function() {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('generateDraft', 'Access denied')
			return
		}

		connection.query('select count(*) "generated" from draftOrder', function(error, rows) {
			if (error) {
				adminSocketHandler.error('generateDraft', 'Server error')
				return
			}

			if (rows[0].generated) {
				adminSocketHandler.send('generateDraft', false)
				return
			}

			connection.query('select id from users', function(error, rows) {
				if (error) {
					adminSocketHandler.error('generateDraft', 'Server error')
					return
				}

				var userIDs = rows.map(function(row) {
					return row.id
				})

				for (var i = 0; i < 42; ++i) {
					userIDs.sort(function(a, b) {
						return Number(Math.random() >= 0.5) * 2 - 1
					})
				}

				userIDs = userIDs.map(function(id, position) {
					return [
						position,
						id
					]
				})

				connection.query('insert into draftOrder (position, id) values ?', [userIDs], function(error) {
					if (error) {
						adminSocketHandler.error('generateDraft', 'Server error')
						return
					}

					adminSocketHandler.send('generateDraft', true)
				})
			})
		})
	})

	adminSocketHandler.register('getDraftOrder', function() {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('getDraftOrder', 'Access denied')
			return
		}

		connection.query('select a.id, concat(firstName, " ", lastName) name, b.position, active from users a, draftOrder b where a.id=b.id order by position', function(error, rows) {
			if (error) {
				adminSocketHandler.error('getDraftOrder', 'Server error')
				return
			}

			adminSocketHandler.send('getDraftOrder', rows)
		})
	})

	adminSocketHandler.register('removeUser', function(id) {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('removeUser', 'Access denied')
			return
		}

		connection.query('select id from users where id=?', [id], function(error, rows) {
			if (error) {
				adminSocketHandler.error('removeUser', 'Server error')
				return
			}

			if (!rows.length) {
				adminSocketHandler.error('removeUser', 'Invalid user id')
				return
			}

			connection.query('delete from users where id=?', [id], function(error) {
				if (error) {
					adminSocketHandler.error('removeUser', 'Server error')
					return
				}

				adminSocketHandler.send('removeUser', 'Removed user')
			})
		})
	})
}

module.exports = admin
