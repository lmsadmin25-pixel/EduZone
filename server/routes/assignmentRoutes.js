const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  createAssignment, getAssignmentsByCourse, submitAssignment,
  getSubmissions, gradeSubmission
} = require('../controllers/assignmentController');

router.post('/', protect, roleAuth('educator'), createAssignment);
router.get('/course/:courseId', protect, getAssignmentsByCourse);
router.post('/:id/submit', protect, roleAuth('student'), submitAssignment);
router.get('/:id/submissions', protect, roleAuth('educator'), getSubmissions);
router.put('/submissions/:id/grade', protect, roleAuth('educator'), gradeSubmission);

module.exports = router;
