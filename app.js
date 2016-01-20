var express = require('express')
var app = express()
var http = require('http').Server(app)
var bodyParser = require('body-parser')

var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')

var path = require('path')

var config = require('./config')
var connection = require('./database')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))

app.all('*', function(request, response, next) {
	response.header('Access-Control-Allow-Origin', '*')
	response.header('Access-Control-Allow-Headers', 'Content-Type')
	next()
})

app.post('/api/signIn', function(request, response) {
	var email = request.body.email.trim()
	var password = request.body.password.trim()

	if (!(email && password)) {
		response.json({
			error: 'Invalid inputs'
		})
		return
	}

	connection.query('select id, email, password from users where email=?', [email], function(error, rows) {
		if (error) {
			response.json({
				error: 'Server error'
			})
			return
		}

		if (rows.length) {
			bcrypt.compare(password, rows[0].password, function(error, result) {
				if (error) {
					response.json({
						error: 'Server error'
					})
					return
				}

				if (result) {
					var profile = {
						id: rows[0].id,
						email: rows[0].emial
					}

					var token = jwt.sign(profile, config.jwtSecret, { expiresIn: 60 * 60 * 24 })

					response.json({
						token: token
					})
				}
				else {
					response.json({
						error: 'Invalid email/password combination'
					})
				}
			})
		}
		else {
			response.json({
				error: 'Invalid email/password combination'
			})
		}
	})
})

app.post('/api/signUp', function(request, response) {
	var firstName = request.body.firstName.trim()
	var lastName = request.body.lastName.trim()
	var email = request.body.email.trim()
	var position = request.body.position
	var password = request.body.password.trim()

	if (!(firstName && lastName && email && position && password)) {
		response.json({
			errors: ['Invalid inputs']
		})
		return
	}

	var errors = []

	// Validation

	if (errors.length) {
		response.json({
			errors: errors
		})
		return
	}

	connection.query('select id from users where email=?', [email], function(error, rows) {
		if (error) {
			response.json({
				error: 'Server error'
			})
			return
		}

		if (rows.length) {
			response.json({
				errors: ['Email already in use']
			})
			return
		}

		bcrypt.hash(password, 8, function(error, hash) {
			if (error) {
				response.json({
					error: 'Server error'
				})
				return
			}

			connection.query('insert into users (firstName, lastName, email, position, password) values (?, ?, ?, ?, ?)', [firstName, lastName, email, position, hash], function(error) {
				if (error) {
					response.json({
						error: 'Server error'
					})
					return				
				}

				connection.query('select id, email from users where email=?', [email], function(error, rows) {
					if (error) {
						response.json({
							error: 'Server error'
						})
						return				
					}

					var profile = {
						id: rows[0].id,
						email: rows[0].email
					}

					var token = jwt.sign(profile, config.jwtSecret, { expiresIn: 60 * 60 * 24 })

					response.json({
						token: token
					})
				})
			})
		})
	})
})

http.listen(8080, '127.0.0.1')
