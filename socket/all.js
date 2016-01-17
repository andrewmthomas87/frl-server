var admin = require('./admin')
var event = require('./event')
var events = require('./events')
var team = require('./team')
var teams = require('./teams')
var user = require('./user')
var users = require('./users')

function registerSocketHandlers(socket) {
	admin(socket)
	event(socket)
	events(socket)
	team(socket)
	teams(socket)
	user(socket)
	users(socket)
}

module.exports = registerSocketHandlers
