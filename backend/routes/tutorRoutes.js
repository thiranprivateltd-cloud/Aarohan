const express = require('express');
const { askTutor } = require('../controllers/tutorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/ask', protect, askTutor);

module.exports = router;
