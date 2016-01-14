var team = require('./team')
var teams = require('./teams')
var user = require('./user')

function registerSocketHandlers(socket) {
	team(socket)
	teams(socket)
	user(socket)
}

module.exports = registerSocketHandlers
