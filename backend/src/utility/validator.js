const validateInput = (input, type) => {
	if (!input) return false
	switch (type) {
		case 'identifier':
			return (
				input.length >= 7 &&
				input.length <= 55 &&
				(!/[^a-zA-Z0-9]+/.test(input) || /.+@.+/.test(input)));
		case 'username':
			return !(input.length < 7 || input.length > 25 || /[^a-zA-Z0-9]+/.test(input))
		case 'password':
			return !(input.length < 7 || input.length > 255 || !(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(input)))
		case 'email':
			return (/.+@.+/.test(input))
		case 'fname':
		case 'lname':
			return (input.length >= 3 && input.length <= 255 && !(/[^a-zA-Z]+/.test(input)))
		case 'looking':
			return !(input != 'male' && input != 'female' && input != 'both')
		case 'gender':
			return !(input != 'male' && input != 'female' && input != 'both')
		case 'msg':
			return (input.length > 0 && input.length < 2048)
		case 'phone':
			return !(input.length > 15 || !(/^\d{10}$/.test(input)))
		default:
			return false
	}
}

module.exports = validateInput
