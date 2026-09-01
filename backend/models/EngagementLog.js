const mongoose = require('mongoose');

const expressionSampleSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    expression: { type: String },
    confidence: { type: Number },
  },
  { _id: false }
);

const engagementLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    sessionStart: { type: Date, default: Date.now },
    tabSwitchCount: { type: Number, default: 0 },
    idleSeconds: { type: Number, default: 0 },
    avgTimePerSection: { type: Number, default: 0 },
    expressionSamples: [expressionSampleSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('EngagementLog', engagementLogSchema);
