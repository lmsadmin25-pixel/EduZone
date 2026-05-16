const sendEmail = require('../utils/sendEmail');
const { contactFormTemplate } = require('../services/emailTemplates');

// @desc    Submit contact form
// @route   POST /api/contact
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await sendEmail({
      to: process.env.SMTP_USER, // Send to admin email
      subject: `EduZone Contact: ${subject}`,
      html: contactFormTemplate(name, email, subject, message)
    });

    res.json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContactForm };
