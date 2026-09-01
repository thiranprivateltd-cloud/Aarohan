const mongoose = require('mongoose');

const contentDetailSchema = new mongoose.Schema(
  {
    text: { type: String },
    examples: [{ type: String }],
    keyPoints: [{ type: String }],
    translations: {
      en: { type: Object },
      ta: { type: Object },
      hi: { type: Object },
    },
  },
  { _id: false }
);

const quizQuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
  },
  { _id: false }
);

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    content: {
      easy: contentDetailSchema,
      medium: contentDetailSchema,
      hard: contentDetailSchema,
    },
    quiz: [quizQuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
