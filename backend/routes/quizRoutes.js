const express = require('express');
const { submitQuiz } = require('../controllers/quizController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.post('/submit', optionalProtect, submitQuiz);

module.exports = router;
