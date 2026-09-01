const express = require('express');
const { getRecommendedCourses, getNextLesson } = require('../controllers/courseController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/recommended', optionalProtect, getRecommendedCourses);
router.get('/lessons/next', optionalProtect, getNextLesson);

module.exports = router;
