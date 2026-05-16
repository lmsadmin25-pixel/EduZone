const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { addReview, getReviewsByCourse } = require('../controllers/reviewController');

router.post('/', protect, roleAuth('student'), addReview);
router.get('/course/:courseId', getReviewsByCourse);

module.exports = router;
