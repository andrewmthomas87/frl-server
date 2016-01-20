var io = require('socket.io').listen(5000)
var jwt = require('jsonwebtoken')

var config = require('./config')
var connection = require('./database')

var registerSocketHandlers = require('./socket/all')

io.on('connection', function(socket) {
	delete io.sockets.connected[socket.id]

	var connectTimeout = setTimeout(function() {
		socket.disconnect('unauthorized')
	}, config.connectTimeout)

	socket.on('authenticate', function(data) {
		clearTimeout(connectTimeout)

		jwt.verify(data.token, config.jwtSecret, function(error, decoded) {
			if (error) {
				socket.disconnect('unauthorized')
			}
			if (!error && decoded) {
				connection.query('select id from users where id=?', [decoded.id], function(error, rows) {
					if (error || !rows.length) {
						return
					}

					io.sockets.connected[socket.id] = socket

					socket.decodedToken = decoded
					socket.connectedAt = new Date()

					socket.on('disconnect', function() {
						console.info('SOCKET [%s] DISCONNECTED', socket.id)
					})

					console.info('SOCKET [%s] CONNECTED', socket.id)
					socket.emit('authenticated')
				})
			}
		})
	})

	registerSocketHandlers(socket)
})
