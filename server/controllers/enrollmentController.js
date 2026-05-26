const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

// @desc    Enroll in a course (free)
// @route   POST /api/enrollments
const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if already enrolled
    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

    // For paid courses, check if payment is done (handled by payment controller)
    if (!course.isFree) {
      return res.status(400).json({ message: 'This is a paid course. Please complete payment first.' });
    }

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId
    });

    // Update course enrolled count
    course.enrolledStudents += 1;
    await course.save();

    // Add to student's enrolled courses
    await Student.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: courseId }
    });

    // Create notification
    await Notification.create({
      user: req.user._id,
      userType: 'Student',
      title: 'Enrollment Successful',
      message: `You have been enrolled in "${course.title}"`,
      type: 'enrollment'
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's enrollments
// @route   GET /api/enrollments/my
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'educator', select: 'name avatar' }
      })
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson progress
// @route   PUT /api/enrollments/:id/progress
const updateProgress = async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    if (!lessonId) return res.status(400).json({ message: 'lessonId is required' });

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Normalise all stored IDs to strings for reliable comparison
    const completedSet = new Set(enrollment.completedLessons.map(id => id.toString()));
    const lessonIdStr = lessonId.toString();

    if (!completedSet.has(lessonIdStr)) {
      completedSet.add(lessonIdStr);
      enrollment.completedLessons = Array.from(completedSet);
    }

    // Re-fetch course to get authoritative lesson count
    const course = await Course.findById(enrollment.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const totalLessons = course.lessons.length;
    enrollment.progress = totalLessons > 0
      ? Math.min(100, Math.round((completedSet.size / totalLessons) * 100))
      : 0;

    // Mark course as completed when all lessons done
    if (enrollment.progress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      await Student.findByIdAndUpdate(req.user._id, {
        $addToSet: { completedCourses: enrollment.course }
      });
    }

    await enrollment.save();
    res.json({ message: 'Progress updated', enrollment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get enrolled students for a course (Educator)
// @route   GET /api/enrollments/:courseId/students
const getEnrolledStudents = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 });

    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

module.exports = { enrollCourse, getMyEnrollments, updateProgress, getEnrolledStudents };
