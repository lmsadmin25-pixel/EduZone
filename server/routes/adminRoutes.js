const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  getDashboardStats, getAllStudents, getAllEducators,
  approveEducator, toggleBlockUser, getAllCourses, getAllEnrollments
} = require('../controllers/adminController');
const {
  getAllWithdrawals, getWithdrawalStats,
  approveWithdrawal, rejectWithdrawal
} = require('../controllers/withdrawalAdminController');
const { adminGetAllAssignments } = require('../controllers/assignmentController');
const { adminGetAllTests } = require('../controllers/testController');

router.use(protect, roleAuth('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/educators', getAllEducators);
router.get('/enrollments', getAllEnrollments);
router.put('/educators/:id/approve', approveEducator);
router.put('/users/:id/block', toggleBlockUser);
router.get('/courses', getAllCourses);

// Assignments & Quizzes monitoring
router.get('/assignments', adminGetAllAssignments);
router.get('/quizzes', adminGetAllTests);

// Withdrawal management
router.get('/withdrawals', getAllWithdrawals);
router.get('/withdrawals/stats', getWithdrawalStats);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);

module.exports = router;
