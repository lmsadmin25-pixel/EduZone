const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  duration: { type: String, default: '' },
  order: { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: [
      'Web Development', 'Mobile Development', 'Data Science',
      'Machine Learning', 'Cyber Security', 'Cloud Computing',
      'Database', 'Programming', 'Design', 'Other'
    ]
  },
  thumbnail: {
    type: String,
    default: ''
  },
  educator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Educator',
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: true
  },
  lessons: [lessonSchema],
  enrolledStudents: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  language: {
    type: String,
    default: 'English'
  }
}, { timestamps: true });

// Text index for search
courseSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Course', courseSchema);
