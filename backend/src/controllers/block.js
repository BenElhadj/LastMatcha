const userModel = require('../models/userModel')
const notifModel = require('../models/notificationsModel')
const matchingModel = require('../models/matchingModel')
const chatModel = require('../models/chatModel')

// Block user 

const blockUser = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id))
		return res.json({ msg: 'Invalid request' })
	try {
		const alreadyBlocked = await userModel.isBlocked(req.user.id, req.body.id);
		if (!alreadyBlocked) {
			await userModel.blockUser(req.user.id, req.body.id)
			await chatModel.disallowConv(req.user.id, req.body.id)
			await matchingModel.delMatche(req.user.id, req.body.id)
			await notifModel.delNotif(req.user.id, req.body.id)
			await chatModel.delConv(req.user.id, req.body.id)
			return res.json({ ok: true })
		} else {
			return res.json({ msg: 'User already Blocked' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

// Unblock user

const unblockUser = async (req, res) => {
	if (!req.user.id) {
		return res.json({ msg: 'Not logged in' })}
	if (!req.body.id || isNaN(req.body.id)){
		return res.json({ msg: 'Invalid request' })}
	try {
		const result = await userModel.unblockUser(req.user.id, req.body.id)
		// result is undefined, so check if the unblock actually deleted a row
		// Let's re-query to check if the block still exists
		const stillBlocked = await userModel.isBlocked(req.user.id, req.body.id);
		if (stillBlocked) {
			return res.json({ msg: 'Cannot unblock user' })
		}
		res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

// Report User 

const reportUser = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id))
		return res.json({ msg: 'Invalid request' })
	try {
		   await userModel.reportUser(req.body.id)
		   return res.json({ ok: true })
	   } catch (err) {
		   return res.json({ msg: 'Fatal error', err })
	   }
	}

	module.exports = {
	   blockUser,
	   unblockUser,
	   reportUser
	}