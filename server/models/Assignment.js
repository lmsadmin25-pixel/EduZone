const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
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
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  totalMarks: {
    type: Number,
    default: 100
  },
  attachmentUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
