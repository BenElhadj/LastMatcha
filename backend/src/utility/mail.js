

const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const { readFile } = require('fs');
const { resolve, dirname } = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendMail = async (to, key, type) => {
	try {
		console.log('[sendMail] Preparing email for:', to, 'type:', type);
		const path = resolve(dirname(__dirname), 'views', 'mail.ejs');
		const raw = await readFileAsync(path, 'utf8');
		console.log('[sendMail] Loaded mail.ejs template');
		const data = {
			title: type === 'users/verify' ? 'Check email' : 'Reset password',
			body: `Thank you for your registration.\nThere is one last step left before you find the love of your life!\nPlease click this link to ${type === 'users/verify' ? 'Verify your account' : 'Reset your password'}`,
			action: type === 'users/verify' ? 'Check' : 'Reset',
			url: `${process.env.API_URL}/api/${type}/${key}`
		};
		console.log('[sendMail] Render data:', data);
		const html = ejs.render(raw, data);
		console.log('[sendMail] HTML rendered, sending with SendGrid API...');
		const msg = {
			to,
			from: process.env.SENDGRID_FROM || 'noreply@matcha.com',
			subject: data.title,
			html
		};
		await sgMail.send(msg);
		console.log('[sendMail] Email sent successfully to:', to);
	} catch (err) {
		console.error('[sendMail] Error sending mail:', err);
	}
};

module.exports = { sendMail };
