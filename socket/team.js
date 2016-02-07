var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function team(io, socket) {
	var teamSocketHandler = SocketHandler(io, socket, 'Team')

	teamSocketHandler.register('get', function(teamNumber) {
		connection.query('select teamNumber, name, website, location, rookieYear, owner, concat(firstName, " ", lastName) userName from teams left outer join users on owner=id where teamNumber=?', [teamNumber], function(error, rows) {
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

			connection.query('select averageCCWM, averageSeed, eventWins from teamStats where teamNumber=?', [teamNumber], function(error, rows) {
				if (error) {
					teamSocketHandler.error('get', 'Server error')
					return
				}

				if (rows.length) {
					team.averageCCWM = rows[0].averageCCWM
					team.averageSeed = rows[0].averageSeed
					team.eventWins = rows[0].eventWins
				}

				connection.query('select a.code, name, week from teamEvents a, events b where a.code=b.code && teamNumber=? order by week', [teamNumber], function(error, rows) {
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
	})
}

module.exports = team
