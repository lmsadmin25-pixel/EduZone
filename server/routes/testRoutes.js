const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  createTest, getTestsByCourse, getTestById, submitTest, deleteTest
} = require('../controllers/testController');

router.post('/', protect, roleAuth('educator'), createTest);
router.get('/course/:courseId', protect, getTestsByCourse);
router.get('/:id', protect, getTestById);
router.post('/:id/submit', protect, roleAuth('student'), submitTest);
router.delete('/:id', protect, roleAuth('educator'), deleteTest);

module.exports = router;
