var teams = require('./teams')
var user = require('./user')

function registerSocketHandlers(socket) {
	teams(socket)
	user(socket)
}

module.exports = registerSocketHandlers
