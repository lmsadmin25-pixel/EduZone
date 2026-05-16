// Reusable email HTML templates for EduZone LMS

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

const headerStyle = `
  background: #1E3A5F;
  color: #ffffff;
  padding: 24px;
  text-align: center;
`;

const bodyStyle = `padding: 32px 24px;`;

const buttonStyle = `
  display: inline-block;
  background: #F4B400;
  color: #1E3A5F;
  padding: 12px 32px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  margin: 16px 0;
`;

const footerStyle = `
  background: #f5f5f5;
  padding: 16px 24px;
  text-align: center;
  color: #888;
  font-size: 12px;
`;

// Password reset email
const passwordResetTemplate = (name, resetUrl) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;">🎓 EduZone</h1>
    </div>
    <div style="${bodyStyle}">
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align:center;">
        <a href="${resetUrl}" style="${buttonStyle}">Reset Password</a>
      </div>
      <p style="color:#888;font-size:14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
    <div style="${footerStyle}">© 2026 EduZone LMS. All rights reserved.</div>
  </div>
`;

// Educator approval email
const educatorApprovedTemplate = (name) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;">🎓 EduZone</h1>
    </div>
    <div style="${bodyStyle}">
      <h2>Congratulations! 🎉</h2>
      <p>Hi ${name},</p>
      <p>Your educator account has been <strong>approved</strong> by our admin team. You can now log in and start creating courses on EduZone!</p>
      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="${buttonStyle}">Go to Dashboard</a>
      </div>
    </div>
    <div style="${footerStyle}">© 2026 EduZone LMS. All rights reserved.</div>
  </div>
`;

// Payment success email
const paymentSuccessTemplate = (name, courseName, amount) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;">🎓 EduZone</h1>
    </div>
    <div style="${bodyStyle}">
      <h2>Payment Successful! ✅</h2>
      <p>Hi ${name},</p>
      <p>Your payment has been confirmed. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Course</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${courseName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">₹${amount}</td></tr>
        <tr><td style="padding:8px;"><strong>Status</strong></td><td style="padding:8px;color:green;">Completed</td></tr>
      </table>
      <p>You can now access all course content from your dashboard.</p>
    </div>
    <div style="${footerStyle}">© 2026 EduZone LMS. All rights reserved.</div>
  </div>
`;

// Contact form email
const contactFormTemplate = (name, email, subject, message) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;">🎓 EduZone - Contact Form</h1>
    </div>
    <div style="${bodyStyle}">
      <h2>New Contact Message</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Subject</strong></td><td style="padding:8px;border-bottom:1px solid #eee;">${subject}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f9f9f9;border-radius:6px;">
        <p style="margin:0;">${message}</p>
      </div>
    </div>
    <div style="${footerStyle}">© 2026 EduZone LMS. All rights reserved.</div>
  </div>
`;

// Enrollment notification email
const enrollmentTemplate = (name, courseName) => `
  <div style="${baseStyle}">
    <div style="${headerStyle}">
      <h1 style="margin:0;">🎓 EduZone</h1>
    </div>
    <div style="${bodyStyle}">
      <h2>Welcome to the Course! 📚</h2>
      <p>Hi ${name},</p>
      <p>You have been successfully enrolled in <strong>${courseName}</strong>.</p>
      <p>Start learning now from your dashboard!</p>
      <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/my-courses" style="${buttonStyle}">Start Learning</a>
      </div>
    </div>
    <div style="${footerStyle}">© 2026 EduZone LMS. All rights reserved.</div>
  </div>
`;

module.exports = {
  passwordResetTemplate,
  educatorApprovedTemplate,
  paymentSuccessTemplate,
  contactFormTemplate,
  enrollmentTemplate
};
