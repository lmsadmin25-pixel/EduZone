const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateId: {
    type: String,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  downloadUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Auto-generate unique certificate ID before saving
certificateSchema.pre('save', function (next) {
  if (!this.certificateId) {
    this.certificateId = 'EDZ-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
