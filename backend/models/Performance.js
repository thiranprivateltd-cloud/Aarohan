const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    topicScores: { type: Map, of: Number, default: {} },
    currentLevel: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    currentDifficulty: { type: Number, default: 1 },
    history: [
      {
        date: { type: Date, default: Date.now },
        score: { type: Number },
        level: { type: String },
        engagementScore: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Performance', performanceSchema);
