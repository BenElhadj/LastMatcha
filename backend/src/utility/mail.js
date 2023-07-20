const nodemailer = require('nodemailer')
const conf = require('../config/smtp')
const ejs = require('ejs')
const { readFile } = require('fs')
const { resolve, dirname } = require('path')
const { promisify } = require('util')
const readFileAsync = promisify(readFile)

const sendMail = async (to, key, type) => {
	try {
		const path = resolve(dirname(__dirname), 'views', 'mail.ejs')
		const raw = await readFileAsync(path, 'utf8')
		const data = {
			title: type == 'users/verify' ? 'Vérifier email' : 'Réinitialiser mot de passe',
			body: `Veuillez cliquer sur ce lien pour ${type == 'users/verify' ? 'Vérifier votre compte' : 'Réinitialiser votre mot de passe'}`,
			action: type == 'users/verify' ? 'Vérifier' : 'Réinitialiser',
			url: `${process.env.API_URL}api/${type}/${key}`
		}
		const html = ejs.render(raw, data)
		let transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS
			}
		})
		await transporter.sendMail({
			from: 'Matcha team',
			subject: data.title,
			html,
			to
		})
	} catch (err) {
		console.log('Got error here -->', err)
	}
}

module.exports = { sendMail }
