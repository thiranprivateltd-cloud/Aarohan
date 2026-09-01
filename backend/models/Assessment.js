const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    type: { type: String, enum: ['baseline', 'placement'], required: true },
    score: { type: Number, required: true },
    answers: [{ type: Object }],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assessment', assessmentSchema);
