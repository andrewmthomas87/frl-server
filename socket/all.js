var admin = require('./admin')
var event = require('./event')
var events = require('./events')
var team = require('./team')
var teams = require('./teams')
var user = require('./user')
var users = require('./users')

function registerSocketHandlers(io, socket) {
	admin(io, socket)
	event(io, socket)
	events(io, socket)
	team(io, socket)
	teams(io, socket)
	user(io, socket)
	users(io, socket)
}

module.exports = registerSocketHandlers
