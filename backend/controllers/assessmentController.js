const axios = require('axios');
const Assessment = require('../models/Assessment');
const Performance = require('../models/Performance');
const { baselineQuestions } = require('../seeds/seedContent');

const getBaselineQuestions = async (req, res) => {
  return res.status(200).json({ questions: baselineQuestions });
};

const submitAssessment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, answers, courseId } = req.body; // type: "baseline" or "placement"

    let correctCount = 0;
    const totalQuestions = answers ? answers.length : 1;

    if (answers && Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (ans.selectedOption === ans.correctIndex) {
          correctCount += 1;
        }
      });
    }

    const quizScore = Math.round((correctCount / totalQuestions) * 100);

    // Call ML service to compute starting tier
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    let recommendation = { level: 'easy', difficulty: 1, confidence: 0.9 };

    try {
      const mlRes = await axios.post(`${mlServiceUrl}/recommend`, {
        quizScore,
        previousScores: [],
        attemptCount: 1,
        avgTimePerQuestion: 15,
        engagementScore: null,
      });
      recommendation = mlRes.data;
    } catch (e) {
      console.warn("ML Service error in assessment, using fallback logic");
      if (quizScore >= 70) recommendation = { level: 'hard', difficulty: 3, confidence: 0.9 };
      else if (quizScore >= 40) recommendation = { level: 'medium', difficulty: 2, confidence: 0.9 };
    }

    // Save assessment record if DB connected
    try {
      await Assessment.create({
        userId,
        courseId: courseId || null,
        type: type || 'baseline',
        score: quizScore,
        answers: answers || [],
      });

      if (courseId) {
        await Performance.findOneAndUpdate(
          { userId, courseId },
          {
            currentLevel: recommendation.level,
            currentDifficulty: recommendation.difficulty,
            $push: {
              history: {
                date: new Date(),
                score: quizScore,
                level: recommendation.level,
                engagementScore: 1.0,
              },
            },
          },
          { upsert: true, new: true }
        );
      }
    } catch (dbErr) {
      console.warn("DB save skipped for assessment:", dbErr.message);
    }

    return res.status(200).json({
      score: quizScore,
      correctCount,
      totalQuestions,
      recommendation,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getBaselineQuestions, submitAssessment };
