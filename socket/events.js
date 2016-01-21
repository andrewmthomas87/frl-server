var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function events(io, socket) {
	var eventsSocketHandler = SocketHandler(io, socket, 'Events')

	eventsSocketHandler.register('getSearchables', function() {
		connection.query('select code "key", name from events', function(error, rows) {
			if (error) {
				eventsSocketHandler.error('getSearchables', 'Error fetching events')
				return
			}

			eventsSocketHandler.send('getSearchables', rows)
		})
	})
}

module.exports = events
