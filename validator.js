
var validator = (function() {

	var firstName = function(firstName) {
		return !!firstName || 'Empty input'
	}

	var lastName = function(lastName) {
		return !!lastName || 'Empty input'
	}

	var email = function(email) {
		return !!email || 'Empty input'
	}

	var position = function(position) {
		return !!position || 'Empty input'
	}

	var slack = function(slack) {
		return !!slack || 'Empty input'
	}

	var password = function(password) {
		return !!password || 'Empty input'
	}

})()

module.exports = validator
