const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  enrollCourse, getMyEnrollments, updateProgress, getEnrolledStudents
} = require('../controllers/enrollmentController');

router.post('/', protect, roleAuth('student'), enrollCourse);
router.get('/my', protect, roleAuth('student'), getMyEnrollments);
router.put('/:id/progress', protect, roleAuth('student'), updateProgress);
router.get('/:courseId/students', protect, roleAuth('educator'), getEnrolledStudents);

module.exports = router;
