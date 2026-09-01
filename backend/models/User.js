const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'educator', 'admin'], default: 'student' },
    language: { type: String, enum: ['en', 'ta', 'hi', 'ml', 'te'], default: 'en' },
    learningStyle: { type: String, default: 'visual' },
    accessibilityPrefs: { type: Object, default: {} },
    pace: { type: String, default: 'medium' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
