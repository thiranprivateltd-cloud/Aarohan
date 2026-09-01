const express = require('express');
const router = express.Router();
const { protect, checkRole } = require('../middleware/auth');
const { getAdminStats, createCourse, getAllCourses } = require('../controllers/adminController');

router.get('/stats', protect, checkRole(['admin']), getAdminStats);
router.post('/courses', protect, checkRole(['admin']), createCourse);
router.get('/courses', protect, checkRole(['admin']), getAllCourses);

module.exports = router;
