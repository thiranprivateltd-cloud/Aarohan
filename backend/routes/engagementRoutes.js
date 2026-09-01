const express = require('express');
const { logEngagement } = require('../controllers/engagementController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/log', protect, logEngagement);

module.exports = router;
