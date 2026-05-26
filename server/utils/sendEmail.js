const nodemailer = require('nodemailer');

const SMTP_CONFIGURED =
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  !process.env.SMTP_USER.includes('your_email') &&
  !process.env.SMTP_PASS.includes('your_app_password');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // Gmail requires SSL on 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};


// Send email helper function
const sendEmail = async ({ to, subject, html }) => {
  if (!SMTP_CONFIGURED) {
    console.warn('⚠️  Email not sent — SMTP credentials not configured in environment variables.');
    console.warn('   Set SMTP_HOST, SMTP_USER, SMTP_PASS in your Render environment settings.');
    // Return gracefully — don't crash the API
    return { skipped: true, reason: 'SMTP not configured' };
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"EduZone LMS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error.message);
    throw error;
  }
};

module.exports = sendEmail;

