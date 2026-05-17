const Test = require('../models/Test');
const Question = require('../models/Question');
const Notification = require('../models/Notification');

// @desc    Create a test/quiz
// @route   POST /api/tests
const createTest = async (req, res, next) => {
  try {
    const { title, courseId, duration, questions } = req.body;
    const test = await Test.create({
      title, course: courseId, educator: req.user._id,
      duration: duration || 30, isPublished: true
    });
    let totalMarks = 0;
    if (questions && questions.length > 0) {
      for (const q of questions) {
        const question = await Question.create({
          test: test._id, questionText: q.questionText,
          options: q.options, correctAnswer: q.correctAnswer, marks: q.marks || 1
        });
        test.questions.push(question._id);
        totalMarks += question.marks;
      }
    }
    test.totalMarks = totalMarks;
    await test.save();
    res.status(201).json({ message: 'Test created successfully', test });
  } catch (error) { next(error); }
};

// @desc    Get tests for a course
// @route   GET /api/tests/course/:courseId
const getTestsByCourse = async (req, res, next) => {
  try {
    const tests = await Test.find({ course: req.params.courseId, isPublished: true })
      .populate('questions').sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) { next(error); }
};

// @desc    Get single test with questions
// @route   GET /api/tests/:id
const getTestById = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json(test);
  } catch (error) { next(error); }
};

// @desc    Submit quiz answers
// @route   POST /api/tests/:id/submit
const submitTest = async (req, res, next) => {
  try {
    const { answers } = req.body;
    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) return res.status(404).json({ message: 'Test not found' });
    let score = 0, totalMarks = 0;
    const results = [];
    for (const question of test.questions) {
      const userAnswer = answers[question._id.toString()];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score += question.marks;
      totalMarks += question.marks;
      results.push({
        questionId: question._id, questionText: question.questionText,
        options: question.options, correctAnswer: question.correctAnswer,
        userAnswer: userAnswer || 'Not answered', isCorrect, marks: question.marks
      });
    }
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    await Notification.create({
      user: req.user._id, userType: 'Student', title: 'Quiz Completed',
      message: `You scored ${score}/${totalMarks} (${percentage}%) in "${test.title}"`,
      type: 'grade'
    });
    res.json({ testTitle: test.title, score, totalMarks, percentage, results });
  } catch (error) { next(error); }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
const deleteTest = async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    await Question.deleteMany({ test: test._id });
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) { next(error); }
};

// @desc    Admin — get all quizzes with platform-wide stats
// @route   GET /api/admin/quizzes
const adminGetAllTests = async (req, res, next) => {
  try {
    const tests = await Test.find()
      .populate('course', 'title category')
      .populate('educator', 'name email')
      .populate('questions')
      .sort({ createdAt: -1 });

    const attempts = await Notification.countDocuments({ title: 'Quiz Completed' });

    const scoreNotifs = await Notification.find({ title: 'Quiz Completed' });
    let totalPct = 0, validCount = 0;
    for (const n of scoreNotifs) {
      const match = n.message?.match(/\((\d+)%\)/);
      if (match) { totalPct += parseInt(match[1]); validCount++; }
    }
    const avgScore = validCount > 0 ? (totalPct / validCount).toFixed(1) : null;

    res.json({
      tests,
      stats: {
        total: tests.length,
        totalAttempts: attempts,
        totalQuestions: tests.reduce((s, t) => s + (t.questions?.length || 0), 0),
        avgScore
      }
    });
  } catch (error) { next(error); }
};

module.exports = { createTest, getTestsByCourse, getTestById, submitTest, deleteTest, adminGetAllTests };
