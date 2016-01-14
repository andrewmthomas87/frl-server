var Promise = require('promise')

var config = require('./config')
var BlueAlliance = require('./blueAlliance')
var connection = require('../database')

function getEvents(year) {
	return BlueAlliance.event.events(year).then(function(events) {
		return events.filter(function(event) {
			return event['event_type'] < 3
		}).map(function(event) {
			return event['key']
		})
	})
}

function getAverageSeeds(events) {
	return new Promise(function(resolve, reject) {
		var averageSeeds = {}
		var seedsPromises = []

		events.forEach(function(event, index) {
			setTimeout(function() {
				seedsPromises.push(BlueAlliance.event.rankings(event).then(function(seeds) {
					for (var i = 1; i < seeds.length; ++i) {
						var teamNumber = seeds[i][1]
						var seed = parseInt(seeds[i][0])

						if (!averageSeeds[teamNumber]) {
							averageSeeds[teamNumber] = []
						}

						averageSeeds[teamNumber].push(seed)
					}
				}))
			}, index * 100)
		})

		setTimeout(function() {
			Promise.all(seedsPromises).then(function() {
				for (var teamNumber in averageSeeds) {
					var sum = 0

					for (var i = 0; i < averageSeeds[teamNumber].length; ++i) {
						sum += averageSeeds[teamNumber][i]
					}

					averageSeeds[teamNumber] = sum / averageSeeds[teamNumber].length
				}

				resolve(averageSeeds)
			})
		}, events.length * 100)
	})
}

function getAverageCCWMs(events) {
	return new Promise(function(resolve, reject) {
		var averageCCWMs = {}
		var statsPromises = []

		events.forEach(function(event, index) {
			setTimeout(function() {
				statsPromises.push(BlueAlliance.event.stats(event).then(function(stats) {
					for (var teamNumber in stats.ccwms) {
						if (!averageCCWMs[teamNumber]) {
							averageCCWMs[teamNumber] = []
						}

						averageCCWMs[teamNumber].push(stats.ccwms[teamNumber])
					}
				}))
			}, index * 100)
		})

		setTimeout(function() {
			Promise.all(statsPromises).then(function() {
				for (var teamNumber in averageCCWMs) {
					var sum = 0

					for (var i = 0; i < averageCCWMs[teamNumber].length; ++i) {
						sum += averageCCWMs[teamNumber][i]
					}

					averageCCWMs[teamNumber] = sum / averageCCWMs[teamNumber].length
				}

				resolve(averageCCWMs)
			})
		}, events.length * 100)
	})
}

function getEventWins(events) {
	return new Promise(function(resolve, reject) {
		var eventWins = {}
		var awardsPromises = []

		events.forEach(function(event, index) {
			setTimeout(function() {
				awardsPromises.push(BlueAlliance.event.awards(event).then(function(awards) {
					awards = awards.filter(function(award) {
						return award['award_type'] === 1
					}).map(function(award) {
						return award['recipient_list'].map(function(recipient) {
							return recipient['team_number']
						})
					})

					var winners = awards[0]

					for (var i = 0; i < winners.length; ++i) {
						if (!eventWins[winners[i]]) {
							eventWins[winners[i]] = 1
						}
						else {
							++eventWins[winners[i]]
						}
					}
				}))
			}, index * 100)
		})

		setTimeout(function() {
			Promise.all(awardsPromises).then(function() {
				resolve(eventWins)
			})
		}, events.length * 100)

	})
}

var statPromises = []

var averageSeeds = {}
var averageCCWMs = {}
var eventWins = {}

statPromises.push(new Promise(function(resolve, reject) {
	getEvents(2014).then(function(events) {
		var statPromises2014 = []

		statPromises2014.push(getAverageSeeds(events).then(function(averageSeeds2014) {
			for (var teamNumber in averageSeeds2014) {
				if (!averageSeeds[teamNumber]) {
					averageSeeds[teamNumber] = averageSeeds2014[teamNumber]
				}
				else {
					averageSeeds[teamNumber] = (averageSeeds[teamNumber] + averageSeeds2014[teamNumber]) / 2
				}
			}
		}))

		statPromises2014.push(getAverageCCWMs(events).then(function(averageCCWMs2014) {
			for (var teamNumber in averageCCWMs2014) {
				if (!averageCCWMs[teamNumber]) {
					averageCCWMs[teamNumber] = averageCCWMs2014[teamNumber]
				}
				else {
					averageCCWMs[teamNumber] = (averageCCWMs[teamNumber] + averageCCWMs2014[teamNumber]) / 2
				}
			}
		}))

		statPromises2014.push(getEventWins(events).then(function(eventWins2014) {
			for (var teamNumber in eventWins2014) {
				if (!eventWins[teamNumber]) {
					eventWins[teamNumber] = eventWins2014[teamNumber]
				}
				else {
					eventWins[teamNumber] += eventWins2014[teamNumber]
				}
			}
		}))

		Promise.all(statPromises2014).then(resolve)
	})
}))

statPromises.push(new Promise(function(resolve, reject) {
	getEvents(2015).then(function(events) {
		var statPromises2015 = []

		statPromises2015.push(getAverageSeeds(events).then(function(averageSeeds2015) {
			for (var teamNumber in averageSeeds2015) {
				if (!averageSeeds[teamNumber]) {
					averageSeeds[teamNumber] = averageSeeds2015[teamNumber]
				}
				else {
					averageSeeds[teamNumber] = (averageSeeds[teamNumber] + averageSeeds2015[teamNumber]) / 2
				}
			}
		}))

		statPromises2015.push(getAverageCCWMs(events).then(function(averageCCWMs2015) {
			for (var teamNumber in averageCCWMs2015) {
				if (!averageCCWMs[teamNumber]) {
					averageCCWMs[teamNumber] = averageCCWMs2015[teamNumber]
				}
				else {
					averageCCWMs[teamNumber] = (averageCCWMs[teamNumber] + averageCCWMs2015[teamNumber]) / 2
				}
			}
		}))

		statPromises2015.push(getEventWins(events).then(function(eventWins2015) {
			for (var teamNumber in eventWins2015) {
				if (!eventWins[teamNumber]) {
					eventWins[teamNumber] = eventWins2015[teamNumber]
				}
				else {
					eventWins[teamNumber] += eventWins2015[teamNumber]
				}
			}
		}))

		Promise.all(statPromises2015).then(resolve)
	})
}))

Promise.all(statPromises).then(function() {
	var statsArray = []

	for (var teamNumber in averageSeeds) {
		statsArray.push([teamNumber, averageSeeds[teamNumber], averageCCWMs[teamNumber], eventWins[teamNumber]])
	}

	connection.query('truncate table teamStats', function(error) {
		if (error) {
			throw error
		}

		connection.query('insert into teamStats (teamNumber, averageSeed, averageCCWM, eventWins) values ?', [statsArray], function(error) {
			if (error) {
				throw error
			}

			process.exit()
		})
	})
})
