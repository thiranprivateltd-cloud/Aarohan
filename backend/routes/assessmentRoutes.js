const express = require('express');
const { getBaselineQuestions, submitAssessment } = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/baseline', protect, getBaselineQuestions);
router.post('/submit', protect, submitAssessment);

module.exports = router;
