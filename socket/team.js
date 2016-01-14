var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function team(socket) {
	var teamSocketHandler = SocketHandler(socket, 'Team')

	teamSocketHandler.register('get', function(teamNumber) {
		connection.querySelector('select a.teamNumber, name, website, location, rookieYear, averageSeed, averageCCWM from teams a teamStats b where a.teamNumber=b.teamNumber', function(error, rows) {
			if (error) {
				teamSocketHandler.error('get', 'Error fetching team')
				return
			}

			if (!rows.length) {
				teamSocketHandler.error('get', 'Invalid team number')
			}

			teamSocketHandler.send('get', rows[0])
		})
	})
}

module.exports = team
