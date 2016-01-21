var connected = require('../connected')

var SocketHandler = function(io, socket, namespace) {

	var eventFor = function(type) {
		return namespace + '.' + type
	}

	var register = function(type, handler) {
		socket.on(eventFor(type), handler)
	}

	var send = function(type, data) {
		console.log(eventFor(type))
		socket.emit(eventFor(type), data)
	}

	var error = function(type, error) {
		console.log(eventFor(type) + ' ERROR')
		var data = {
			type: 'error'
		}

		if (typeof error === 'string') {
			data.error = error
		}
		else {
			data.errors = error
		}

		socket.emit(eventFor(type), data)
	}

	var blast = function(data, event) {
		console.log(event || 'Notification')
		io.emit(event || 'Notification', data)
	}

	var update = function(data, event) {
		console.log(event || 'Notification')
		var socketIDs = connected.get(socket.decodedToken.id)

		socketIDs.forEach(function(socketID) {
			io.to(socketID).emit(event || 'Notification', data)
		})
	}

	return {
		register: register,
		send: send,
		error: error,
		blast: blast,
		update: update
	}

}

module.exports = SocketHandler
