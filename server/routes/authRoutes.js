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

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/educator', registerEducator);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user._id, req.user.role || 'student');
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&role=${req.user.role || 'student'}`);
  }
);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
