var validatorUtility = require('validator')

var validator = (function() {

	var firstName = function(firstName) {
		if (firstName.length && !validatorUtility.isAlpha(firstName)) {
			return 'First name must only contain English characters'
		}

		return !!firstName || 'Empty input'
	}

	var lastName = function(lastName) {
		if (lastName.length && !validatorUtility.isAlpha(lastName)) {
			return 'Last name must only contain English characters'
		}

		return !!lastName || 'Empty input'
	}

	var email = function(email) {
		if (email.length && !validatorUtility.normalizeEmail(email)) {
			return 'Email must be a valid email address'
		}

		return !!email || 'Empty input'
	}

	var position = function(position) {
		if (isNaN(position) || position > 2 || positon < 1) {
			return 'Position must be student or mentor'
		}

		return true
	}

	var slack = function(slack) {
		if (slack.length && slack[0] !== '@') {
			return 'Slack username must begin with @'
		}

		if (slack.length && !validatorUtility.isAscii(slack)) {
			return 'Slack username must not contain invalid characters'
		}

		return true
	}

	var password = function(password) {
		if (password.length < 6) {
			return 'Password must contain at least 6 characters'
		}

		if (validatorUtility.isAscii(password)) {
			return 'Password must not contain invalid characters'
		}

		return true
	}

	return {
		firstName: firstName,
		lastName: lastName,
		email: email,
		position: position,
		slack: slack,
		password: password
	}

})()

module.exports = validator
