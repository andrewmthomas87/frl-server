var config = require('../config')
var connection = require('../database')

var SocketHandler = require('./SocketHandler')

function admin(socket) {
	var adminSocketHandler = SocketHandler(socket, 'Admin')

	adminSocketHandler.register('verify', function() {
		connection.query('select admin from users where id=?', [socket.decodedToken.id], function(error, rows) {
			if (error) {
				adminSocketHandler.error('verify', 'Server error')
				return
			}

			if (rows.length && rows[0].admin) {
				adminSocketHandler.send('verify', 'Access granted')
			}
			else {
				adminSocketHandler.error('verify', 'Access denied')
			}
		})
	})
}

module.exports = admin
