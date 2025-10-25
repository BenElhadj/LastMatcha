const jwt = require('jsonwebtoken')

const { jwtBlacklist } = require('../controllers/auth')
const userModel = require('../models/userModel')

const auth = async (req, res, next) => {
	const token = req.header('x-auth-token');
	console.log('x-auth-token reçu:', token);
	if (!token)
		return res.json({ msg: 'No token, authorizaton denied' });
	if (jwtBlacklist && jwtBlacklist.has(token)) {
		return res.json({ msg: 'Token is not valid' });
	}
	try {
		const decoded = jwt.verify(token, process.env.SECRET);
		req.user = decoded;
		if (decoded.id) {
			let user = {};
			try {
				user = await userModel.getUserByIdD(decoded.id);
			} catch (err) {
				console.error('err auth in backend/auth.js ===> ', err);
			}
			req.user = user[0];
		}
		next();
	} catch (e) {
		res.json({ msg: 'Token is not valid' });
	}
}

module.exports = auth
