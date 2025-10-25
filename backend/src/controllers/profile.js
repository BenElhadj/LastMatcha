// Upload image de profil
const uploadProfileImage = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	try {
	let link = req.body.link || null;
	let data = req.file ? req.file.buffer.toString('base64') : null;
	await userModel.updateProfilePic(req.user.id)
	await userModel.insertImages({ id: req.user.id, link, data, profile: true, cover: false })
	await userModel.setImages(req.user.id)
	return res.json({ ok: true, status: 'Profile image updated', image: link ? link : data, user_id: req.user.id })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const validator = require('../utility/validator')
const userModel = require('../models/userModel')
const tagsModel = require('../models/tagsModel')
const { randomBytes } = require('crypto')
const { AsyncResource } = require('async_hooks')
const { dirname, resolve } = require('path')

const { readFile, writeFile, unlink } = require('fs')
const writeFileAsync = promisify(writeFile)
const unlinkAsync = promisify(unlink)

const randomHex = () => randomBytes(10).toString('hex')
const isExternal = url => url && (url.indexOf(':') > -1 || url.indexOf('//') > -1 || url.indexOf('www.') > -1)
const tokenExp = { expiresIn: 7 * 24 * 60 * 60 }

// Update user profile 

const updateProfile = async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!validator(req.body.first_name, 'fname'))
		return res.json({ msg: 'First name is invalid' })
	if (!validator(req.body.last_name, 'lname'))
		return res.json({ msg: 'Last name is invalid' })
	if (!validator(req.body.email, 'email'))
		return res.json({ msg: 'Email is invalid' })
	if (!validator(req.body.username, 'username'))
		return res.json({ msg: 'Username is invalid' })
	if (!validator(req.body.gender, 'gender'))
		return res.json({ msg: 'Gender is invalid' })
	if (!validator(req.body.looking, 'looking'))
		return res.json({ msg: 'Looking is invalid' })
	if (!validator(req?.body?.phone, 'phone'))
		return res.json({ msg: 'Phone number is invalid' })
	if (req.body.birthdate && new Date(req.body.birthdate) >= new Date().getTime())
		return res.json({ msg: 'Birthdate is invalid' })
	if (req?.body?.biography?.length > 500)
		return res.json({ msg: 'bio is too large' })
	let Tags
	if (req.body.tags)
		Tags = req.body.tags.split(',')
	else
		Tags = []
	if (Tags.length > 20) return res.json({ msg: 'Too many tags' })
	for (const iterator of Tags) {
		if (iterator.length > 25)
			return res.json({ msg: 'Tags are invalid' })
	}
	try {
		const result = await userModel.getUserById(req.user.id)
		if (result.length) {
			const user = {
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				username: req.body.username,
				email: req.body.email,
				gender: req.body.gender,
				looking: req.body.looking,
				birthdate: req.body.birthdate,
				biography: req.body.biography,
				tags: req.body.tags,
				address: req.body.address,
				city: req.body.city,
				country: req.body.country,
				postal_code: req.body.postal_code,
				phone: req.body.phone,
				id: req.user.id
			}
			const updateRes = await userModel.updateProfile(user)
			if (updateRes) {
				const tagsList = await tagsModel.getTags()
				const tags = tagsList.map(cur => cur.value)
				if (user.tags) {
					for (const element of user.tags.split(', ')) {
						if (!tags.includes(element)) {
							try {
								await tagsModel.insertTags(element)
							} catch (err) {
								return res.json({ msg: 'Fatal error', err })
							}
						}
					}
				}
				return res.json({ ok: true, status: 'User Updated' })
			}
			return res.json({ ok: false, status: 'User not updated' })
		} else {
			return res.json({ ok: false, status: 'User not found' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}


// Change Email 

const changeEmail = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	if (!validator(req.body.email, 'email'))
		return res.json({ msg: 'Email is invalid' })
	if (!validator(req.body.password, 'password'))
		return res.json({ msg: 'Password is invalid' })
	if (req.user.email == req.body.email)
		return res.json({ msg: 'The provided email matches your current email' })
	try {
		let hash = await bcrypt.compare(req.body.password, req.user.password)
		if (!hash)
			return res.json({ msg: 'Wrong password' })
		const result = await userModel.getUserByemail(req.body.email)
		if (result.length)
			return res.json({ msg: 'Email already exists' })
		let user = {
			id: req.user.id,
			email: req.body.email
		}
		const updateRes = await userModel.changeEmail(user)
		if (!updateRes)
			return res.json({ msg: 'Oups something went wrong' })
		return res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

// Change password ~ 

const changePassword = async (req, res) => {
	if (!req.user.id) return res.json({ msg: 'Not logged in' })
	if (!validator(req.body.password, 'password'))
		return res.json({ msg: 'Password is invalid' })
	if (!validator(req.body.newPassword, 'password'))
		return res.json({ msg: 'New password is invalid' })
	if (!req.body.confNewPassword || req.body.newPassword != req.body.confNewPassword)
		return res.json({ msg: 'Confirmation password is invalid' })
	if (req.body.password == req.body.newPassword)
		return res.json({ msg: 'The provided password matches your current password' })
	try {
		let hash = await bcrypt.compare(req.body.password, req.user.password)
		if (!hash)
			return res.json({ msg: 'Wrong password' })
		const password = await bcrypt.hash(req.body.newPassword, 10)
		let user = {
			password: password,
			id: req.user.id
		}
		const updateRes = await userModel.changePassword(user)
		if (!updateRes)
			return res.json({ msg: 'Oups something went wrong' })
		return res.json({ ok: true })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

// Upload images 

const uploadImages = async (req, res) => {
	   if (!req.user.id)
		   return res.json({ msg: 'Not logged in' })
	   try {
		   const images = await userModel.getImages(req.user.id)
		   if (images.length < 5) {
			   let link = req.body.link || null;
			   let data = req.file ? req.file.buffer.toString('base64') : null;
			   let user = {
				   id: req.user.id,
				   link,
				   data,
				   profile: false,
				   cover: false
			   }
			   try {
				   const insertRes = await userModel.insertImages(user)
				   console.log(`[UPLOAD] Insertion DB :`, insertRes)
			   } catch (dbErr) {
				   console.error(`[UPLOAD] Erreur insertion DB :`, dbErr)
				   return res.json({ msg: 'Erreur insertion DB', err: dbErr })
			   }
			   await userModel.setImages(req.user.id)
			   return res.json({ ok: true, status: 'Image Updated', image: link ? link : data, user_id: req.user.id })
		   } else {
			   return res.json({ msg: 'User already has 5 photos' })
		   }
	   } catch (err) {
		   console.error(`[UPLOAD] Erreur générale :`, err)
		   return res.json({ msg: 'Fatal error', err })
	   }
}

// Upload cover 

const uploadCover = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	try {
		const result = await userModel.getCover(req.user.id)
		if (result.length) {
			if (!isExternal(result[0].link)) {
				try {
					await unlinkAsync(resolve(dirname(dirname(__dirname)), 'uploads', result[0].link))
				} catch (err) {
					return res.json({ msg: 'Fatal error', err })
				}
			}
			await userModel.delCover(result[0].id, req.user.id)
		}
		let link = req.body.link || null;
		let data = req.file ? req.file.buffer.toString('base64') : null;
		const insertRes = await userModel.insertCover(req.user.id, link, data)
		if (!insertRes)
			return res.json({ msg: 'Oups.. Something went wrong!' })
		return res.json({ ok: true, status: 'Image Updated', image: link ? link : data, user_id: req.user.id })
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

// DELETE IMAGES

const deleteImage = async (req, res) => {
	if (!req.user.id)
		return res.json({ msg: 'Not logged in' })
	if (!req.body.id || isNaN(req.body.id))
		return res.json({ msg: 'Invalid request' })
	try {
		const result = await userModel.getImagesById(req.body.id, req.user.id)
		if (result.length) {
			if (!isExternal(result[0].link)) {
				try {
					await unlinkAsync(resolve(dirname(dirname(__dirname)), 'uploads', result[0].link))
				} catch (err) {
					return res.json({ msg: 'Fatal error', err })
				}
			}
			const delRes = await userModel.delImage(req.body.id, req.user.id)
			if (!req.body.profile) {
				await userModel.setImages(req.user.id)
			}
			if (delRes)
				return res.json({ ok: true })
			return res.json({ msg: 'Oups something went wrong' })
		} else {
			return res.json({ msg: 'Oups something went wrong' })
		}
	} catch (err) {
		return res.json({ msg: 'Fatal error', err })
	}
}

const blacklisted = async (req, res) => {
	if (!req.user.id) {
	  return res.json({ msg: 'not logged in' })
	}
	const id = req.body.id; 
	if (!Array.isArray(id) || !id.length) {
	  return res.json({ msg: 'bad query' })
	}
	const placehoder = `(${id.map(cur => '?').join(', ')}`
	try {
	  const result = await userModel.blacklist(id, placehoder)
	  res.json({
		ok: true,
		list: result
	  });
	} catch (err) {
	  return res.json({ msg: 'Fatal error', err })
	}
}


module.exports = {
	updateProfile,
	changeEmail,
	changePassword,
	uploadImages,
	uploadCover,
	deleteImage,
	blacklisted,
	uploadProfileImage
}