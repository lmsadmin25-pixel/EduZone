const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const educatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  expertise: {
    type: String,
    default: ''
  },
  qualification: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpiry: Date
}, { timestamps: true });

// Hash password before saving
educatorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (this.password === 'google-oauth-no-password') return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
educatorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Educator', educatorSchema);
