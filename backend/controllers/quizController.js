const Performance = require('../models/Performance');
const EngagementLog = require('../models/EngagementLog');
const Lesson = require('../models/Lesson');

// Ultra-fast in-memory user performance state
const inMemoryPerformance = new Map();
const inMemoryEngagement = new Map();

const submitQuiz = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const { lessonId, answers, engagementData } = req.body;

    let correctCount = 0;
    const totalQuestions = answers && answers.length > 0 ? answers.length : 1;

    if (answers && Array.isArray(answers)) {
      answers.forEach((ans) => {
        if (Number(ans.selectedOption) === Number(ans.correctIndex)) {
          correctCount += 1;
        }
      });
    }

    const quizScore = Math.round((correctCount / totalQuestions) * 100);

    let engagementScore = 1.0;
    if (engagementData) {
      const switches = Number(engagementData.tabSwitchCount || 0);
      const idle = Number(engagementData.idleSeconds || 0);
      const switchPenalty = Math.min(0.5, switches * 0.1);
      let idlePenalty = 0.0;
      if (idle > 15) {
        idlePenalty = Math.min(0.4, (idle / 100));
      }
      engagementScore = Math.max(0.0, Number((1.0 - switchPenalty - idlePenalty).toFixed(2)));
      inMemoryEngagement.set(`${userId}_${lessonId}`, engagementScore);
    } else if (inMemoryEngagement.has(`${userId}_${lessonId}`)) {
      engagementScore = inMemoryEngagement.get(`${userId}_${lessonId}`);
    }

    let baseTier = 1;
    if (quizScore < 40) baseTier = 1;
    else if (quizScore <= 70) baseTier = 2;
    else baseTier = 3;

    let finalTier = baseTier;
    let engagementNote = null;

    if (engagementScore !== null && engagementScore < 0.4) {
      finalTier = Math.max(1, baseTier - 1);
      engagementNote = 'reduced due to low engagement signals';
    }

    const tierMap = { 1: 'easy', 2: 'medium', 3: 'hard' };
    const newLevel = tierMap[finalTier];

    let previousLevel = 'easy';
    let courseId = 'c_1';

    if (inMemoryPerformance.has(`${userId}_${courseId}`)) {
      previousLevel = inMemoryPerformance.get(`${userId}_${courseId}`).currentLevel || 'easy';
    }

    const leveledUp = previousLevel !== newLevel;

    inMemoryPerformance.set(`${userId}_${courseId}`, {
      currentLevel: newLevel,
      currentDifficulty: finalTier,
      lastScore: quizScore,
      engagementScore,
    });

    setImmediate(async () => {
      try {
        await Performance.findOneAndUpdate(
          { userId, courseId },
          {
            currentLevel: newLevel,
            currentDifficulty: finalTier,
            $push: {
              history: {
                date: new Date(),
                score: quizScore,
                level: newLevel,
                engagementScore,
              },
            },
          },
          { upsert: true }
        );
      } catch (e) {}
    });

    return res.status(200).json({
      score: quizScore,
      correctCount,
      totalQuestions,
      previousLevel,
      newLevel,
      leveledUp,
      recommendation: {
        level: newLevel,
        difficulty: finalTier,
        confidence: 0.95,
        engagementNote,
      },
      engagementScore,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { submitQuiz, inMemoryPerformance };
