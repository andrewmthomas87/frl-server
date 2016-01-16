var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function events(socket) {
	var eventsSocketHandler = SocketHandler(socket, 'Events')

	eventsSocketHandler.register('getSearchables', function() {
		connection.query('select code, name from events', function(error, rows) {
			if (error) {
				eventsSocketHandler.error('getSearchables', 'Error fetching events')
			}

			eventsSocketHandler.send('getSearchables', rows)
		})
	})
}

module.exports = events
