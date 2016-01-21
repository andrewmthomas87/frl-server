var connected = (function() {
	var sockets = {}

	var add = function(socket) {
		var id = socket.decodedToken.id

		sockets[id] = sockets[id] || []

		sockets[id].push(socket.id)
	}

	var remove = function(socket) {
		var id = socket.decodedToken.id

		sockets[id] = sockets[id].filter(function(socketID) {
			return socketID !== socket.id
		})
	}

	var get = function(id) {
		return sockets[id] || []
	}

	return {
		add: add,
		remove: remove,
		get: get
	}
})()

module.exports = connected
