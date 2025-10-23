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

	console.log('[LOGIN] Tentative avec identifier:', identifier);

	if (!validator(identifier, 'identifier')) {
		console.log('[LOGIN] Identifiant invalide');
		return res.json({ msg: 'Username or email is invalid' });
	}
	if (!validator(password, 'password')) {
		console.log('[LOGIN] Mot de passe invalide');
		return res.json({ msg: 'Password is invalid' });
	}
	try {
		const result = await userModel.getUserByIdentifier(identifier);
		if (!result || result.length === 0) {
			console.log('[LOGIN] Utilisateur non trouvé');
			return res.json({ msg: 'User not found' });
		}
		const user = result[0];
		console.log('[LOGIN] Utilisateur trouvé:', user.username, '| verified:', user.verified);
		if (!user.verified && user.verified !== true) {
			// Pour compatibilité : accepte 0/1 ou true/false
			console.log('[LOGIN] Utilisateur non vérifié');
			return res.json({ msg: 'Unverified user. Please verify your account' });
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			console.log('[LOGIN] Mauvais mot de passe');
			return res.json({ msg: 'Wrong password' });
		}
		// Nettoyage des champs sensibles
		delete user.password;
		delete user.verified;
		delete user.tokenExpiration;
		user.images = await userModel.getImagesByUid(user.id);
		const payload = { id: user.id };
		user.token = await sign(payload, process.env.SECRET, tokenExp);
		connectedUsers[user.id] = user.id;
		console.log('[LOGIN] Connexion réussie pour:', user.username);
		return res.json(user);
	} catch (err) {
		console.error('[LOGIN] Fatal error:', err);
		return res.json({ msg: 'Fatal error', err });
	}
}

// Logout 

const logout = async (req, res) => {
	if (!req.user || !req.user.id)
		return res.json({ msg: 'Not logged in' });
	if (!connectedUsers[req.user.id]) {
		return res.json({ msg: 'Already logged out' });
	}
	delete connectedUsers[req.user.id];
	console.log('---> ', connectedUsers);
	await userModel.updateStatus(req.user.id, new Date());
	res.json({ ok: true });
}

// isLoggedIn 

const isLoggedIn = async (req, res) => {
	if (!req.user || !req.user.id) {
		return res.json({ msg: 'Not logged in' });
	}
	try {
		const result = await userModel.getUserById(req.user.id);
		if (!result || result.length === 0) {
			return res.json({ msg: 'Not logged in' });
		}
		const user = result[0];
		delete user.password;
		delete user.verified;
		delete user.tokenExpiration;
		user.images = await userModel.getImagesByUid(user.id);
		const payload = { id: user.id };
		user.token = await sign(payload, process.env.SECRET, tokenExp);
		return res.json(user);
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