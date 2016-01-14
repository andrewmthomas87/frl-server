var Promise = require('promise')

var BlueAlliance = require('./blueAlliance')
var connection = require('../database')

function getTeams(numberTeams) {
	return new Promise(function(resolve, reject) {
		var numberPages = Math.ceil(numberTeams / 500)
		var teams = []
		var teamPromises = []

		for (var i = 0; i < numberPages; ++i) {
			var teamPromise = BlueAlliance.team.teams(i)
			teamPromises.push(teamPromise)
			teamPromise.then(function(teamsPage) {
				for (var j = 0, length = teamsPage.length; j < length; ++j) {
					if (teamsPage[j].name) {
						var website = teamsPage[j].website
						if (website === 'http://www.firstinspires.org/' || website === 'Coming Soon') {
							website = null
						}
						else if (website && !(website.indexOf('http://') === 0 || website.indexOf('https://') === 0)) {
							website = 'http://' + website
						}

						teams.push([
							teamsPage[j]['team_number'],
							teamsPage[j]['nickname'] || teamsPage[j]['name'],
							website,
							teamsPage[j]['location'],
							teamsPage[j]['rookie_year']
						])
					}
				}
			})
		}

		Promise.all(teamPromises).then(function() {
			resolve(teams)
		})
	})
}

getTeams(7000).then(function(teams) {
	connection.query('truncate table teams', function(error) {
		if (error) {
			throw error
		}

		connection.query('insert into teams (teamNumber, name, website, location, rookieYear) values ?', [teams], function(error) {
			if (error) {
				throw error
			}

			process.exit()
		})
	})
})
