

const nodemailer = require('nodemailer');
const smtpConf = require('../config/smtp');
const ejs = require('ejs');
const { readFile } = require('fs');
const { resolve, dirname } = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);


const sendMail = async (to, key, type) => {
	try {
		const path = resolve(dirname(__dirname), 'views', 'mail.ejs');
		const raw = await readFileAsync(path, 'utf8');
		const data = {
			title: type === 'users/verify' ? 'Check email' : 'Reset password',
			body: `Thank you for your registration.\nThere is one last step left before you find the love of your life!\nPlease click this link to ${type === 'users/verify' ? 'Verify your account' : 'Reset your password'}`,
			action: type === 'users/verify' ? 'Check' : 'Reset',
			url: `${process.env.API_URL}/api/${type}/${key}`
		};
		const html = ejs.render(raw, data);
		// Use SendGrid transport only
		const transporter = nodemailer.createTransport(smtpConf);
		await transporter.sendMail({
			from: process.env.SENDGRID_FROM || 'noreply@matcha.com',
			to,
			subject: data.title,
			html
		});
	} catch (err) {
		console.error('err sendMail in backend/mail.js ===> ', err);
	}
};

module.exports = { sendMail };
