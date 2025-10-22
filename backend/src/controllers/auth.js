const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sign = promisify(jwt.sign)
const validator = require('../utility/validator')
const htmlspecialchars = require('htmlspecialchars')
const userModel = require('../models/userModel')

const tokenExp = { expiresIn: 7 * 24 * 60 * 60 }
const connectedUsers = {}

// Login

const login = async (req, res) => {
	const identifier = htmlspecialchars(req.body.identifier);
	const password = htmlspecialchars(req.body.password);

	if (!validator(identifier, 'identifier')) {
		return res.json({ msg: 'Username or email is invalid' });
	}
	if (!validator(password, 'password')) {
		return res.json({ msg: 'Password is invalid' });
	}
	try {
		await userModel.getUserByIdentifier(identifier, async (result) => {
			if (result.length === 0) {
				return res.json({ msg: 'User not found' });
			}
			console.log('USER LOGIN RESULT:', result[0]);
			// Compatible PostgreSQL (true/false) et MySQL (0/1)
			if (!result[0].verified) {
				return res.json({ msg: 'Unverified user. Please verify your account' });
			}
			const user = result[0];
			try {
				const decoded = await bcrypt.compare(password, user.password);
				if (!decoded) {
					return res.json({ msg: 'Wrong password' });
				}
				delete user.password;
				delete user.verified;
				delete user.tokenExpiration;
				user.images = await userModel.getImagesByUid(user.id);
				userModel.getUserById(user.id, async () => {
					const payload = { id: user.id };
					user.token = await sign(payload, process.env.SECRET, tokenExp);
					return res.json(user);
				});
				connectedUsers[user.id] = user.id;
				console.log('+++> ', connectedUsers);
			} catch (err) {
				return res.json({ msg: 'Fatal error', err });
			}
		});
	} catch (err) {
		return res.json({ msg: 'Fatal error', err });
	}
}

// Logout 

const logout = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	delete connectedUsers[req.user.id]
	console.log('---> ', connectedUsers)
	await userModel.updateStatus(req.user.id, new Date())
	res.json({ ok: true })
}

// isLoggedIn 

const isLoggedIn = async (req, res) => {
	if (!req.user || !req.user.id) {
		return res.json({ msg: 'Not logged in' });
	}
	try {
		userModel.getUserById(req.user.id, async (result) => {
			if (!result.length) {
				return res.json({ msg: 'Not logged in' });
			}
			const user = result[0];
			delete user.password;
			delete user.verified;
			delete user.tokenExpiration;
			user.images = await userModel.getImagesByUid(user.id);
			const payload = { id: user.id };
			user.token = await sign(payload, process.env.SECRET, tokenExp);
			res.json(user);
		});
	} catch (err) {
		return res.json({ msg: 'Fatal error', err });
	}
}

module.exports = {
	login,
	logout,
	connectedUsers,
	isLoggedIn
}