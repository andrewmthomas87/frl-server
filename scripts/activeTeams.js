var Promise = require('promise')

var config = require('./config')
var BlueAlliance = require('./blueAlliance')
var connection = require('../database')

function getActiveTeams(year) {
	return new Promise(function(resolve, reject) {
		BlueAlliance.event.events(year).then(function(events) {
			var activeTeams = []
			var teamsPromises = []

			for (var i = 0; i < events.length; ++i) {
				var teamsPromise = BlueAlliance.event.teams(year + events[i]['event_code'])
				teamsPromises.push(teamsPromise)
				teamsPromise.then(function(teams) {
					activeTeams = activeTeams.concat(teams.map(function(team) {
						return parseInt(team['team_number'])
					}))
				})
			}

			Promise.all(teamsPromises).then(function() {
				resolve(activeTeams)
			})
		})
	})
}

getActiveTeams(config.year).then(function(activeTeams) {
	connection.query('delete from teams where teamNumber not in ?', [[activeTeams]], function(error) {
		if (error) {
			throw error
		}

		process.exit()
	})
})
