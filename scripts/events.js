var config = require('./config')
var BlueAlliance = require('./blueAlliance')
var connection = require('../database')

var monthLengths = [
	31,
	config.year % 4 ? 28 : 29,
	31,
	30,
	31,
	30,
	31,
	31,
	30,
	31,
	30,
	31
]

var monthOffsets = []
monthOffsets[0] = 0

for (var i = 1; i < 12; ++i) {
	monthOffsets[i] = monthOffsets[i - 1] + monthLengths[i - 1]
}

var startDate = config.startDate.split('-')

var startOffset = monthOffsets[parseInt(startDate[1]) - 1] + parseInt(startDate[2]) - config.startWeek * 7

function getEvents(year) {
	return BlueAlliance.event.events(year).then(function(events) {
		return events.filter(function(event) {
			return event['event_type'] < 3
		}).map(function(event) {
			var offset = event['start_date'].split('-')
			offset = monthOffsets[parseInt(offset[1]) - 1] + parseInt(offset[2]) - startOffset
			return [
				event['event_code'],
				event.name,
				event['event_type'],
				Math.floor(offset / 7),
				event.location
			]
		})
	})
}

getEvents(config.year).then(function(events) {
	connection.query('truncate table events', function(error) {
		if (error) {
			throw error
		}

		connection.query('insert into events (code, name, type, week, location) values ?', [events], function(error) {
			if (error) {
				throw error
			}

			process.exit()
		})
	})
})
