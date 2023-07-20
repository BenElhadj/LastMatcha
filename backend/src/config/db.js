const dbconf = {
	connectionLimit: 10,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: process.env.DB_PORT,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	charset: 'utf8'
}

module.exports = dbconf
