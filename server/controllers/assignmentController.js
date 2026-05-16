const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notification = require('../models/Notification');

// @desc    Create assignment
// @route   POST /api/assignments
const createAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.create({
      ...req.body,
      educator: req.user._id
    });
    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment (Student)
// @route   POST /api/assignments/:id/submit
const submitAssignment = async (req, res, next) => {
  try {
    const { fileUrl } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // Check for existing submission
    const existing = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    const submission = await Submission.create({
      assignment: req.params.id,
      student: req.user._id,
      fileUrl
    });

    // Notify educator
    await Notification.create({
      user: assignment.educator,
      userType: 'Educator',
      title: 'New Submission',
      message: `${req.user.name} submitted "${assignment.title}"`,
      type: 'assignment'
    });

    res.status(201).json({ message: 'Assignment submitted', submission });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions for an assignment (Educator)
// @route   GET /api/assignments/:id/submissions
const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email avatar')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// @desc    Grade submission (Educator)
// @route   PUT /api/submissions/:id/grade
const gradeSubmission = async (req, res, next) => {
  try {
    const { marks, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, isGraded: true },
      { new: true }
    ).populate('student', 'name email');

    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    // Notify student
    await Notification.create({
      user: submission.student._id,
      userType: 'Student',
      title: 'Assignment Graded',
      message: `You scored ${marks} marks. Feedback: ${feedback}`,
      type: 'grade'
    });

    res.json({ message: 'Submission graded', submission });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment, getAssignmentsByCourse, submitAssignment,
  getSubmissions, gradeSubmission
};
