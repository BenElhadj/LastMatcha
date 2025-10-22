
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '[OK]' : '[MISSING]');
console.log('MAIL_USER:', process.env.MAIL_USER);

async function testSMTP() {
  let transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SendGrid SMTP connection successful!');
  } catch (err) {
    console.error('❌ SendGrid SMTP connection failed:', err);
  }
}

testSMTP();
