const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userType: {
    type: String,
    enum: ['Student', 'Educator', 'Admin'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['enrollment', 'payment', 'assignment', 'grade', 'approval', 'general'],
    default: 'general'
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
