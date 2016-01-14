var SocketHandler = function(socket, namespace) {

	var eventFor = function(type) {
		return namespace + '.' + type
	}

	var register = function(type, handler) {
		socket.on(eventFor(type), handler)
	}

	var send = function(type, data) {
		console.log(eventFor(type), data)
		socket.emit(eventFor(type), data)
	}

	var error = function(type, error) {
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

	return {
		register: register,
		send: send,
		error: error
	}

}

module.exports = SocketHandler
