var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function team(io, socket) {
	var teamSocketHandler = SocketHandler(io, socket, 'Team')

	teamSocketHandler.register('get', function(teamNumber) {
		connection.query('select a.teamNumber, name, website, location, rookieYear, owner, averageSeed, averageCCWM, concat(firstName, " ", lastName) userName from teams a, teamStats b, users c where a.teamNumber=b.teamNumber && a.teamNumber=? && ((owner is null && id=1) || id=owner)', [teamNumber], function(error, rows) {
			if (error) {
				teamSocketHandler.error('get', 'Error fetching team')
				return
			}

			if (!rows.length) {
				teamSocketHandler.error('get', 'Invalid team number')
				return
			}

			var team = rows[0]

			if (!team.owner) {
				delete team.userName
			}

			connection.query('select a.code, name, week from teamEvents a, events b where a.code=b.code && teamNumber=?', [teamNumber], function(error, rows) {
				if (error) {
					teamSocketHandler.error('get', 'Server error')
					return
				}

				if (rows.length) {
					team.events = rows.map(function(row) {
						return {
							code: row.code,
							name: row.name
						}
					})
					team.weeks = rows.map(function(row) {
						return row.week
					})
				}

				teamSocketHandler.send('get', team)
			})
		})
	})
}

module.exports = team
