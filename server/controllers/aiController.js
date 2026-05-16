const { generateQuiz, summarizeNotes, getRecommendations } = require('../services/aiService');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    AI Generate Quiz from text
// @route   POST /api/ai/generate-quiz
const aiGenerateQuiz = async (req, res, next) => {
  try {
    const { content, courseId, title, numQuestions } = req.body;

    if (!content) return res.status(400).json({ message: 'Content is required' });

    const questions = await generateQuiz(content, numQuestions || 5);

    // If courseId provided, save to database
    if (courseId) {
      const test = await Test.create({
        title: title || 'AI Generated Quiz',
        course: courseId,
        educator: req.user._id,
        isAIGenerated: true,
        isPublished: true,
        duration: 30
      });

      let totalMarks = 0;
      for (const q of questions) {
        const question = await Question.create({
          test: test._id,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks || 1
        });
        test.questions.push(question._id);
        totalMarks += question.marks;
      }

      test.totalMarks = totalMarks;
      await test.save();

      return res.json({ message: 'AI Quiz generated and saved', test, questions });
    }

    res.json({ message: 'AI Quiz generated', questions });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Summarize notes
// @route   POST /api/ai/summarize
const aiSummarize = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const summary = await summarizeNotes(content);
    res.json({ message: 'Notes summarized', ...summary });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Course Recommendations
// @route   GET /api/ai/recommendations
const aiRecommendations = async (req, res, next) => {
  try {
    // Get student's enrolled course categories
    const enrollments = await Enrollment.find({ student: req.user._id }).populate('course', 'category');
    const enrolledCourseIds = enrollments.map(e => e.course._id.toString());
    const enrolledCategories = [...new Set(enrollments.map(e => e.course.category))];

    // Get all published courses not already enrolled
    const allCourses = await Course.find({
      isPublished: true,
      _id: { $nin: enrolledCourseIds }
    }).populate('educator', 'name avatar');

    const recommendations = await getRecommendations(enrolledCategories, allCourses);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

module.exports = { aiGenerateQuiz, aiSummarize, aiRecommendations };
