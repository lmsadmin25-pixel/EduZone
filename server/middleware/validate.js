const { body, validationResult } = require('express-validator');

// ─── Middleware: run validationResult and return 422 on errors ─────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(422).json({
      message: firstError.msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ─── Rules ────────────────────────────────────────────────────────────────────

const validateRegisterStudent = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  handleValidationErrors
];

const validateRegisterEducator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('qualification')
    .trim()
    .notEmpty().withMessage('Qualification is required')
    .isLength({ min: 2, max: 100 }).withMessage('Qualification must be between 2 and 100 characters'),

  body('expertise')
    .trim()
    .notEmpty().withMessage('Area of expertise is required')
    .isLength({ min: 2, max: 100 }).withMessage('Expertise must be between 2 and 100 characters'),

  body('bio')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),

  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 1 }).withMessage('Password cannot be empty'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['student', 'educator', 'admin']).withMessage('Invalid role selected'),

  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('role')
    .notEmpty().withMessage('Account type is required')
    .isIn(['student', 'educator']).withMessage('Invalid account type'),

  handleValidationErrors
];

const validateResetPassword = [
  body('password')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  handleValidationErrors
];

module.exports = {
  validateRegisterStudent,
  validateRegisterEducator,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
};
