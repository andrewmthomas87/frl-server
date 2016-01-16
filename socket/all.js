var event = require('./event')
var events = require('./events')
var team = require('./team')
var teams = require('./teams')
var user = require('./user')

function registerSocketHandlers(socket) {
	event(socket)
	events(socket)
	team(socket)
	teams(socket)
	user(socket)
}

module.exports = registerSocketHandlers
