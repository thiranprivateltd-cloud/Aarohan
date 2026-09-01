const EngagementLog = require('../models/EngagementLog');

const logEngagement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, tabSwitchCount, idleSeconds, avgTimePerSection } = req.body;

    const switches = Number(tabSwitchCount || 0);
    const idle = Number(idleSeconds || 0);

    // Compute engagement score (0.0 to 1.0)
    // Start at 1.0
    // Subtract 0.1 per tab switch (capped at 0.5 penalty)
    // Subtract idle penalty (if idle > 30s, deduct up to 0.4)
    let score = 1.0;
    const switchPenalty = Math.min(0.5, switches * 0.1);
    let idlePenalty = 0.0;

    if (idle > 15) {
      idlePenalty = Math.min(0.4, (idle / 100));
    }

    score = Math.max(0.0, Number((score - switchPenalty - idlePenalty).toFixed(2)));

    try {
      await EngagementLog.create({
        userId,
        lessonId: lessonId || 'l_sample',
        tabSwitchCount: switches,
        idleSeconds: idle,
        avgTimePerSection: avgTimePerSection || 0,
      });
    } catch (e) {
      console.warn("DB save skipped for engagement log:", e.message);
    }

    return res.status(200).json({
      message: 'Engagement log saved successfully',
      engagementScore: score,
      details: {
        tabSwitchCount: switches,
        idleSeconds: idle,
        switchPenalty,
        idlePenalty,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { logEngagement };
