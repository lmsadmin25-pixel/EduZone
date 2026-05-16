const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  getDashboardStats, getAllStudents, getAllEducators,
  approveEducator, toggleBlockUser, getAllCourses, getAllEnrollments
} = require('../controllers/adminController');

router.use(protect, roleAuth('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/students', getAllStudents);
router.get('/educators', getAllEducators);
router.get('/enrollments', getAllEnrollments);
router.put('/educators/:id/approve', approveEducator);
router.put('/users/:id/block', toggleBlockUser);
router.get('/courses', getAllCourses);

module.exports = router;
