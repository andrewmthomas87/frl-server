var Promise = require('promise')

var config = require('./config')
var BlueAlliance = require('./blueAlliance')
var connection = require('../database')

function getTeamEvents(year) {
	return new Promise(function(resolve, reject) {
		BlueAlliance.event.events(year).then(function(events) {
			var teamEvents = []
			var eventTeamsPromises = []

			events.forEach(function(event) {
				var code = event['event_code']

				var eventTeamsPromise = BlueAlliance.event.teams(year + code)
				eventTeamsPromises.push(eventTeamsPromise)
				eventTeamsPromise.then(function(teams) {
					for (var j = 0; j < teams.length; ++j) {
						teamEvents.push([teams[j]['team_number'], code])
					}
				})
			})

			Promise.all(eventTeamsPromises).then(function() {
				resolve(teamEvents)
			})
		})
	})
}

getTeamEvents(config.year).then(function(teamEvents) {
	connection.query('truncate table teamEvents', function(error) {
		if (error) {
			throw error
		}

		connection.query('insert into teamEvents (teamNumber, code) values ?', [teamEvents], function(error) {
			if (error) {
				throw error
			}

			process.exit()
		})
	})
})
