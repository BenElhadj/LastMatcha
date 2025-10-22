
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('MAIL_SMTP:', process.env.MAIL_SMTP);
console.log('MAIL_PORT:', process.env.MAIL_PORT);
console.log('MAIL_USER:', process.env.MAIL_USER);
console.log('MAIL_PASS:', process.env.MAIL_PASS ? '[OK]' : '[MISSING]');

async function testSMTP() {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
  } catch (err) {
    console.error('❌ SMTP connection failed:', err);
  }
}

testSMTP();
