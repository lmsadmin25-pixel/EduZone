const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  registerStudent,
  registerEducator,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const protect = require('../middleware/auth');
const generateToken = require('../utils/generateToken');
const {
  validateRegisterStudent,
  validateRegisterEducator,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validate');

// Public routes — with validation
router.post('/register/student', validateRegisterStudent, registerStudent);
router.post('/register/educator', validateRegisterEducator, registerEducator);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', validateResetPassword, resetPassword);

// ─── Google OAuth ──────────────────────────────────────────────────────────────
// Step 1: redirect user to Google consent screen
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2: Google redirects back here after consent
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed` }),
  (req, res) => {
    const role = req.user.role || 'student';
    const token = generateToken(req.user._id, role);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&role=${role}`);
  }
  
);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
