const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { aiGenerateQuiz, aiSummarize, aiRecommendations } = require('../controllers/aiController');

router.post('/generate-quiz', protect, roleAuth('educator'), aiGenerateQuiz);
router.post('/summarize', protect, aiSummarize);
router.get('/recommendations', protect, roleAuth('student'), aiRecommendations);

module.exports = router;
