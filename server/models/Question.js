const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  options: {
    type: [String],
    validate: {
      validator: function (v) { return v.length === 4; },
      message: 'A question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required']
  },
  marks: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
