var Promise = require('promise')

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

	adminSocketHandler.register('resetDraft', function() {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('resetDraft', 'Access denied')
			return
		}

		connection.query('truncate table draftOrder', function(error) {
			if (error) {
				adminSocketHandler.error('resetDraft', 'Server error')
				return
			}

			adminSocketHandler.send('resetDraft', 'Draft reset')
		})
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

		connection.query('select a.id, concat(firstName, " ", lastName) name, b.position, active from users a, draftOrder b where a.id=b.id order by b.position', function(error, rows) {
			if (error) {
				adminSocketHandler.error('getDraftOrder', 'Server error')
				return
			}

			adminSocketHandler.send('getDraftOrder', rows)
		})
	})

	adminSocketHandler.register('startDraft', function() {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('startDraft', 'Access denied')
			return
		}

		connection.query('select active from draftOrder where active>0', function(error, rows) {
			if (error) {
				adminSocketHandler.error('startDraft', 'Server error')
				return
			}

			if (rows.length) {
				adminSocketHandler.send('startDraft', rows[0].active)
				return
			}

			connection.query('update draftOrder set active=1 where position=0', function(error) {
				if (error) {
					adminSocketHandler.error('startDraft', 'Server error')
					return
				}

				adminSocketHandler.send('startDraft', 1)
			})
		})
	})

	adminSocketHandler.register('getDraftNextUp', function() {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('getDraftNextUp', 'Access denied')
			return
		}

		connection.query('select concat(firstName, " ", lastName) name, b.position, active from users a, draftOrder b where a.id=b.id && active>0', function(error, rows) {
			if (error) {
				adminSocketHandler.error('getDraftNextUp', 'Server error')
				return
			}

			if (!rows.length) {
				adminSocketHandler.error('getDraftNextUp', 'Draft not in progress')
				return
			}

			var users = rows.slice(0, 1).map(function(user) {
				return {
					name: user.name,
					position: user.position
				}
			})

			var position = rows[0].position
			var active = rows[0].active

			var sign = active % 2 === 0 ? '<' : '>'
			var sort = active % 2 === 0 ? 'desc' : 'asc'

			connection.query('select concat(firstName, " ", lastName) name, b.position from users a, draftOrder b where a.id=b.id && b.position' + sign + position + ' order by b.position ' + sort + ' limit 5', function(error, rows) {
				if (error) {
					adminSocketHandler.error('getDraftNextUp', 'Server error')
					return
				}

				users = users.concat(rows.map(function(user) {
					return {
						name: user.name,
						position: user.position
					}
				}))

				adminSocketHandler.send('getDraftNextUp', {
					round: active,
					nextUp: users
				})
			})
		})
	})

	adminSocketHandler.register('draftSelectTeam', function(teamNumber) {
		if (!isAdmin(socket.decodedToken.id)) {
			adminSocketHandler.error('getDraftNextUp', 'Access denied')
			return
		}

		connection.query('select owner from teams where teamNumber=?', [teamNumber], function(error, rows) {
			if (error) {
				adminSocketHandler.error('draftSelectTeam', 'Server error')
				return
			}

			if (!rows.length) {
				adminSocketHandler.error('draftSelectTeam', 'Invalid team number')
				return
			}

			if (rows[0].owner) {
				adminSocketHandler.error('draftSelectTeam', 'Team not available')
				return
			}

			connection.query('select a.id, a.position, a.active, concat(b.firstName, " ", b.lastName) name from draftOrder a, users b where a.id=b.id && active>0', function(error, rows) {
				if (error) {
					adminSocketHandler.error('draftSelectTeam', 'Server error')
					return
				}

				if (!rows.length) {
					adminSocketHandler.error('draftSelectTeam', 'Draft not in progress')
					return
				}

				var id = rows[0].id
				var position = rows[0].position
				var active = rows[0].active
				var name = rows[0].name

				var nextPosition = position + (active % 2 === 0 ? -1 : 1)

				connection.query('select id from draftOrder where position=?', [nextPosition], function(error, rows) {
					if (error) {
						adminSocketHandler.error('draftSelectTeam', 'Server error')
						return
					}

					if (!rows.length) {
						active++
						nextPosition = position
					}

					connection.query('update draftOrder set active=0 where position=?', [position], function(error) {
						if (error) {
							adminSocketHandler.error('draftSelectTeam', 'Server error')
							return
						}

						connection.query('update draftOrder set active=? where position=?', [
							active,
							nextPosition
						], function(error) {
							if (error) {
								adminSocketHandler.error('draftSelectTeam', 'Server error')
								return
							}

							connection.query('update teams set owner=? where teamNumber=?', [
								id,
								teamNumber
							], function(error) {
								if (error) {
									adminSocketHandler.error('draftSelectTeam', 'Server error')
									return
								}

								adminSocketHandler.send('draftSelectTeam', name + ' selected team ' + teamNumber)
							})
						})
					})
				})
			})
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
