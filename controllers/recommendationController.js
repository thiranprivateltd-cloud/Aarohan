const axios = require('axios');

const getRecommendation = async (req, res) => {
  const { quizScore, previousScores, attemptCount, avgTimePerQuestion, engagementScore } = req.body;

  // Ultra-fast in-process rule-based evaluation (< 5ms response time)
  const score = Number(quizScore || 0);
  let baseTier = 1;
  if (score < 40) baseTier = 1;
  else if (score <= 70) baseTier = 2;
  else baseTier = 3;

  let finalTier = baseTier;
  let engagementNote = null;

  if (engagementScore !== undefined && engagementScore !== null && Number(engagementScore) < 0.4) {
    finalTier = Math.max(1, baseTier - 1);
    engagementNote = 'reduced due to low engagement signals';
  }

  const tierMap = { 1: 'easy', 2: 'medium', 3: 'hard' };

  return res.status(200).json({
    level: tierMap[finalTier],
    difficulty: finalTier,
    confidence: 0.95,
    engagementNote,
  });
};

module.exports = { getRecommendation };
