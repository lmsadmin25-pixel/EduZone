const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Test title is required'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator',
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  duration: {
    type: Number, // in minutes
    default: 30
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
