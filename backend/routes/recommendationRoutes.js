const express = require('express');
const { getRecommendation } = require('../controllers/recommendationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/recommend', protect, getRecommendation);

module.exports = router;
