const Student = require('../models/Student');
const Educator = require('../models/Educator');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { educatorApprovedTemplate } = require('../services/emailTemplates');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalEducators = await Educator.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const pendingEducators = await Educator.countDocuments({ isApproved: false });

    const payments = await Payment.find({ status: 'completed' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Monthly revenue data for charts
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top courses by enrollment
    const topCourses = await Course.find().sort({ enrolledStudents: -1 }).limit(5).select('title enrolledStudents');

    // Category stats
    const categoryStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Completion rate
    const completedEnrollments = await Enrollment.countDocuments({ progress: 100 });
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    res.json({
      totalStudents,
      totalEducators,
      totalCourses,
      totalEnrollments,
      totalRevenue,
      pendingEducators,
      monthlyRevenue,
      topCourses,
      categoryStats,
      completionRate,
      aiQuizCount: 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all educators
// @route   GET /api/admin/educators
const getAllEducators = async (req, res, next) => {
  try {
    const educators = await Educator.find().select('-password').sort({ createdAt: -1 });
    res.json(educators);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve educator
// @route   PUT /api/admin/educators/:id/approve
const approveEducator = async (req, res, next) => {
  try {
    const educator = await Educator.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!educator) return res.status(404).json({ message: 'Educator not found' });

    // Send approval email
    try {
      await sendEmail({
        to: educator.email,
        subject: 'EduZone - Educator Account Approved!',
        html: educatorApprovedTemplate(educator.name)
      });
    } catch (emailErr) {
      console.error('Approval email failed:', emailErr.message);
    }

    // Notify educator
    await Notification.create({
      user: educator._id,
      userType: 'Educator',
      title: 'Account Approved',
      message: 'Your educator account has been approved! You can now create courses.',
      type: 'approval'
    });

    res.json({ message: 'Educator approved', educator });
  } catch (error) {
    next(error);
  }
};

// @desc    Block/unblock user
// @route   PUT /api/admin/users/:id/block
const toggleBlockUser = async (req, res, next) => {
  try {
    const { userType } = req.body; // 'Student' or 'Educator'

    let user;
    if (userType === 'Student') {
      user = await Student.findById(req.params.id);
    } else if (userType === 'Educator') {
      user = await Educator.findById(req.params.id);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      isBlocked: user.isBlocked
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses (Admin)
// @route   GET /api/admin/courses
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('educator', 'name email')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
const getAllEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'name email avatar')
      .populate('course', 'title category price')
      .sort({ enrolledAt: -1 });
    res.json(enrollments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats, getAllStudents, getAllEducators,
  approveEducator, toggleBlockUser, getAllCourses, getAllEnrollments
};
