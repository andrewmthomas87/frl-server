var request = require('request')
var Promise = require('promise')

var config = require('./config')

function get(path) {
	return new Promise(function(resolve, reject) {
		request({
			url: 'http://www.thebluealliance.com/api/v2/' + path,
			headers: {
				'User-Agent': 'request',
				'X-TBA-App-Id': config.appId

			}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				resolve(JSON.parse(body))
			}
		})
	})
}

var team = (function() {

	var teams = function(pageNumber) {
		return get('teams/' + pageNumber)
	}

	var team = function(teamNumber) {
		return get('team/frc' + teamNumber)
	}

	var events = function(teamNumber, year) {
		return get('team/frc' + teamNumber + '/' + year + '/events')
	}

	var eventAwards = function(teamNumber, event) {
		return get('team/frc' + teamNumber + '/event/' + event + '/awards')
	}

	var eventMatches = function(teamNumber, event) {
		return get('team/frc' + teamNumber + '/event/' + event + '/matches')
	}

	var yearsParticipated = function(teamNumber) {
		return get('team/frc' + teamNumber + '/years_participated')
	}

	var media = function(teamNumber, year) {
		return get('team/frc' + teamNumber + '/' + year + '/media')
	}

	var historyEvents = function(teamNumber) {
		return get('team/frc' + teamNumber + '/history/events')
	}

	var historyAwards = function(teamNumber) {
		return get('team/frc' + teamNumber + '/history/awards')
	}

	var historyRobots = function(teamNumber) {
		return get('team/frc' + teamNumber + '/history/robots')
	}

	return {
		teams: teams,
		team: team,
		events: events,
		eventAwards: eventAwards,
		eventMatches: eventMatches,
		yearsParticipated: yearsParticipated,
		media: media,
		historyEvents: historyEvents,
		historyAwards: historyAwards,
		historyRobots: historyRobots
	}

})()

var event = (function() {

	var events = function(year) {
		return get('events/' + year)
	}

	var event = function(event) {
		return get('event/' + event)
	}

	var teams = function(event) {
		return get('event/' + event + '/teams')
	}

	var matches = function(event) {
		return get('event/' + event + '/matches')
	}

	var stats = function(event) {
		return get('event/' + event + '/stats')
	}

	var rankings = function(event) {
		return get('event/' + event + '/rankings')
	}

	var awards = function(event) {
		return get('event/' + event + '/awards')
	}

	var districtPoints = function(event) {
		return get('event/' + event + '/district_points')
	}

	return {
		events: events,
		event: event,
		teams: teams,
		matches: matches,
		stats: stats,
		rankings: rankings,
		awards: awards,
		districtPoints: districtPoints
	}

})()

var match = (function() {

	var match = function(match) {
		return get('match/' + match)
	}

	return {
		match: match
	}

})()

var district = (function() {

	var districts = function(year) {
		return get('districts/' + year)
	}

	var events = function(district, year) {
		return get('district/' + district + '/' + year + '/events')
	}

	var rankings = function(district, year) {
		return get('district/' + district + '/' + year + '/rankings')
	}

	return {
		districts: districts,
		events: events,
		rankings: rankings
	}

})()

var BlueAlliance = {
	team: team,
	event: event,
	match: match,
	district: district
}

module.exports = BlueAlliance
