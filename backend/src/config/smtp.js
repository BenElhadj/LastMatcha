const smtp = {
	host: process.env.MAIL_SMTP,
	port: process.env.MAIL_PORT,
	secure: false,
	auth: {
			service: 'SendGrid',
			user: 'apikey',
			pass: process.env.SENDGRID_API_KEY
	}
}

module.exports = smtp
