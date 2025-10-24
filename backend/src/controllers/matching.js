const userModel = require('../models/userModel')
const notifModel = require('../models/notificationsModel')
const chatModel = require('../models/chatModel')
const matchModel = require('../models/matchingModel')

const { pool } = require('../config/database')

// Match action 


const match = async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (typeof req.body.liked !== 'boolean' || !req.body.id || isNaN(req.body.id))
		return res.json({ msg: 'Invalid request' })
	try {
		let result = await matchModel.getMatche(req.user.id, req.body.id)
		if (req.body.liked) {
			// LIKE: on veut créer un match
			if (result.length) {
				// Déjà matché
				return res.json({ msg: 'User already Matched' })
			}
			await matchModel.insertMatche(req.user.id, req.body.id)
			// Vérifier si l'autre a déjà liké (match réciproque)
			const reverse = await matchModel.getMatche(req.body.id, req.user.id)
			if (reverse.length) {
				// Conversation
				let conv = await chatModel.getConv(req.user.id, req.body.id)
				if (!conv.length) {
					await chatModel.insertConv(req.user.id, req.body.id)
				} else if (conv[0].allowed === false || conv[0].allowed === 0) {
					await chatModel.allowConv(conv[0].id_conversation)
				}
				await notifModel.insertNotif('like_back', req.user.id, req.body.id)
			} else {
				await notifModel.insertNotif('like', req.user.id, req.body.id)
			}
			return res.json({ ok: true })
		} else {
			// UNLIKE: on veut supprimer un match
			if (!result.length) {
				// Pas matché
				return res.json({ msg: 'User not matched' })
			}
			await matchModel.delMatche(req.user.id, req.body.id)
			await chatModel.disallowConv(req.user.id, req.body.id)
			await notifModel.insertNotif('unlike', req.user.id, req.body.id)
			return res.json({ ok: true })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

module.exports = {
	match
}
