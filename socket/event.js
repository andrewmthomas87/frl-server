var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function event(socket) {
	var eventSocketHandler = SocketHandler(socket, 'Event')

	eventSocketHandler.register('get', function(code) {
		connection.query('select code, name, type, week, location from events where code=?', [code], function(error, rows) {
			if (error) {
				eventSocketHandler.error('get', 'Error fetching event')
				return
			}

			if (!rows.length) {
				eventSocketHandler.error('get', 'Invalid code')
				return
			}

			var event = rows[0]

			connection.query('select teamNumber, name from teams where teamNumber in (select teamNumber from teamEvents where code=?) order by teamNumber', [code], function(error, rows) {
				if (error) {
					eventSocketHandler.error('get', 'Server error')
					return
				}

				event.teams = rows

				eventSocketHandler.send('get', event)
			})
		})
	})
}

module.exports = event
