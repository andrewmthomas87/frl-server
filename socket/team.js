var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function team(socket) {
	var teamSocketHandler = SocketHandler(socket, 'Team')

	teamSocketHandler.register('get', function(teamNumber) {
		connection.query('select a.teamNumber, name, website, location, rookieYear, averageSeed, averageCCWM from teams a, teamStats b where a.teamNumber=b.teamNumber && a.teamNumber=?', [teamNumber], function(error, rows) {
			if (error) {
				teamSocketHandler.error('get', 'Error fetching team')
				return
			}

			if (!rows.length) {
				teamSocketHandler.error('get', 'Invalid team number')
				return
			}

			var team = rows[0]

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
