const crypto = require('crypto');
const Student = require('../models/Student');
const Educator = require('../models/Educator');
const Admin = require('../models/Admin');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { passwordResetTemplate, educatorApprovedTemplate } = require('../services/emailTemplates');



// @desc    Register student
// @route   POST /api/auth/register/student
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    const existingEducator = await Educator.findOne({ email });
    if (existingStudent || existingEducator) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const student = await Student.create({ name, email, password });
    const token = generateToken(student._id, 'student');

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        avatar: student.avatar,
        role: 'student'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register educator
// @route   POST /api/auth/register/educator
const registerEducator = async (req, res, next) => {
  try {
    const { name, email, password, qualification, expertise, bio } = req.body;

    const existingStudent = await Student.findOne({ email });
    const existingEducator = await Educator.findOne({ email });
    if (existingStudent || existingEducator) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const educator = await Educator.create({
      name, email, password, qualification, expertise, bio,
      isApproved: false
    });

    // Notify all admins
    const admins = await Admin.find();
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        userType: 'Admin',
        title: 'New Educator Registration',
        message: `${name} has registered as an educator and is waiting for approval.`,
        type: 'approval'
      });
    }

    res.status(201).json({
      message: 'Registration successful. Please wait for admin approval before you can log in.',
      user: {
        id: educator._id,
        name: educator.name,
        email: educator.email,
        role: 'educator'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (student / educator / admin)
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    let user;
    let userRole = role;

    switch (role) {
      case 'student':
        user = await Student.findOne({ email });
        break;
      case 'educator':
        user = await Educator.findOne({ email });
        break;
      case 'admin':
        user = await Admin.findOne({ email });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if educator is approved
    if (role === 'educator' && !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Contact admin.' });
    }

    const token = generateToken(user._id, userRole);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: userRole
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    let user;
    switch (role) {
      case 'student':
        user = await Student.findOne({ email });
        break;
      case 'educator':
        user = await Educator.findOne({ email });
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = passwordResetTemplate(user.name, resetUrl);

    // Try sending email — but don't fail the API if SMTP isn't configured
    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: 'EduZone - Password Reset Request',
        html
      });

      if (emailResult?.skipped) {
        // SMTP not configured — return reset link directly for dev/demo purposes
        return res.json({
          message: 'Email service not configured. Use the reset link below directly.',
          resetUrl,
          note: 'Configure SMTP_HOST, SMTP_USER, SMTP_PASS in Render environment variables to enable email delivery.'
        });
      }
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr.message);
      return res.status(500).json({
        message: 'Password reset token generated but email delivery failed. Contact support.',
        error: emailErr.message
      });
    }

    res.json({ message: 'Password reset email sent successfully. Check your inbox.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // Search in both collections
    let user = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      user = await Educator.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() }
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = async (req, res) => {
  res.json({ user: req.user, role: req.userRole });
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, expertise, qualification, avatar } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    let user;
    switch (req.userRole) {
      case 'student':
        user = await Student.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        break;
      case 'educator':
        if (bio) updateData.bio = bio;
        if (expertise) updateData.expertise = expertise;
        if (qualification) updateData.qualification = qualification;
        user = await Educator.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        break;
      case 'admin':
        user = await Admin.findByIdAndUpdate(req.user._id, updateData, { new: true }).select('-password');
        break;
    }

    res.json({ message: 'Profile updated', user, role: req.userRole });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  registerEducator,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
};
