const express = require('express');
const { getEducatorOverview, getWeakTopics, getStudents, getStudentDetails } = require('../controllers/educatorController');
const { optionalProtect } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', optionalProtect, getEducatorOverview);
router.get('/weak-topics', optionalProtect, getWeakTopics);
router.get('/students', optionalProtect, getStudents);
router.get('/students/:studentId', optionalProtect, getStudentDetails);

module.exports = router;
