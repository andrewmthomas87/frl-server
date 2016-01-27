var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function teams(io, socket) {
	var teamsSocketHandler = SocketHandler(io, socket, 'Teams')

	teamsSocketHandler.register('get', function() {
		connection.query('select teamNumber, name, owner from teams', function(error, rows) {
			if (error) {
				teamsSocketHandler.error('get', 'Error fetching teams')
				return
			}

			var teams = {}

			for (var i = 0; i < rows.length; ++i) {
				teams[rows[i].teamNumber] = {
					name: rows[i].name,
					owner: rows[i].owner,
					weeks: []
				}
			}

			connection.query('select a.teamNumber, b.week from teamEvents a, events b where a.code=b.code', function(error, rows) {
				if (error) {
					teamsSocketHandler.error('get', 'Error fetching teams')
					return
				}

				for (var i = 0; i < rows.length; ++i) {
					if (teams[rows[i].teamNumber]) {
						teams[rows[i].teamNumber].weeks.push(rows[i].week)
					}
				}

				Object.keys(teams).forEach(function(teamNumber) {
					teams[teamNumber].weeks.sort()
				})

				connection.query('select teamNumber, averageSeed, averageCCWM, eventWins from teamStats', function(error, rows) {
					if (error) {
						teamsSocketHandler.error('get', 'Error fetching teams')
						return
					}

					for (var i = 0; i < rows.length; ++i) {
						if (teams[rows[i].teamNumber]) {
							teams[rows[i].teamNumber].averageSeed = rows[i].averageSeed
							teams[rows[i].teamNumber].averageCCWM = rows[i].averageCCWM
							teams[rows[i].teamNumber].eventWins = rows[i].eventWins
						}
					}

					var teamsArray = []

					for (var teamNumber in teams) {
						var team = teams[teamNumber]
						team.teamNumber = teamNumber
						teamsArray.push(team)
					}

					teamsSocketHandler.send('get', teamsArray)
				})
			})
		})
	})
}

module.exports = teams
