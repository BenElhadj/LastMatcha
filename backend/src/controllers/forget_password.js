const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const sign = promisify(jwt.sign)
const mailer = require('../utility/mail')
const validator = require('../utility/validator')
const userModel = require('../models/userModel')
const { randomBytes } = require('crypto')
const randomHex = () => randomBytes(10).toString('hex')
const tokenExp = { expiresIn: 7200 }
let LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

// Sending  forget password email 

const forget_password = async (req, res) => {
	console.log('[forget_password] Received request for:', req.body.email);
	if (!validator(req.body.email, 'email')) {
		console.log('[forget_password] Invalid email format:', req.body.email);
		return res.json({ msg: 'Email is invalid' });
	}
	try {
		const key = randomHex();
		console.log('[forget_password] Generated key:', key);
		const user = {
			rkey: key,
			email: req.body.email
		};
		const affectedRows = await userModel.addRkey(user);
		console.log('[forget_password] addRkey result:', affectedRows);
		if (!affectedRows) {
			console.log('[forget_password] Email not found in DB:', req.body.email);
			return res.json({ msg: 'Email not found' });
		}
		console.log('[forget_password] Sending recovery email...');
		await mailer.sendMail(req.body.email, key, 'auth/recover');
		console.log('[forget_password] Email sent (no error thrown)');
		return res.json({ ok: true });
	} catch (err) {
		console.error('[forget_password] Fatal error:', err);
		return res.json({ msg: 'Fatal error', err });
	}
}

// Recover password [after sending email]

const recover_password = async (req, res) => {
	if (!req.params.key)
		return res.json({ msg: 'Invalid request' });
	try {
		const rkey = req.params.key;
		userModel.getRkey(rkey, async (result) => {
			if (!result.length)
				return res.json({ msg: 'Invalid key' });
			else {
				const payload = { id: result[0].id };
				const token = await sign(payload, process.env.SECRET, tokenExp);
				return res.redirect(`${process.env.APP_URL}/recover?key=${rkey}&token=${token}`);
			}
		});
	} catch (err) {
	  return res.json({ msg: 'Fatal error', err });
	}
}

/// Key check 

const check_key = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	if (!req.body.key)
		return res.json({ msg: 'Invalid request' })
	if (!validator(req.body.password, 'password'))
		return res.json({ msg: 'Password is invalid' })
	try {
		const hashed = await bcrypt.hash(req.body.password, 10)
		let user = {
			id: req.user.id,
			rkey: req.body.key,
			password: hashed,
		}
		const key = req.body.key
		await userModel.getRkey(key, async (result) => {
			if (!result.length)
				return res.json({ msg: 'Invalid key' })
			await userModel.changeFrogottenPassword(user, (result) => {
				if (!result.affectedRows)
					return res.json({ msg: 'Oups something went wrong' })
				res.json({ ok: true })
			})
		})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

/// Key destroy 

const destroy_key = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	try {
		await userModel.destroyRkey(id, (result) => {
			if (!result.affectedRows)
				return res.json({ msg: 'Error' })
			res.json({ ok: true })
		})
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

module.exports = {
	forget_password,
	recover_password,
	check_key,
	destroy_key,
}
