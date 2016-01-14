var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function user(socket) {
	var userSocketHandler = SocketHandler(socket, 'User')

	userSocketHandler.register('get', function() {
		console.log(socket.decodedToken.id)
	})
}

module.exports = user
