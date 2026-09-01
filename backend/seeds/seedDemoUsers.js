const connectDB = require('../config/db');
const User = require('../models/User');
const Performance = require('../models/Performance');
const bcrypt = require('bcryptjs');

const seedDemoAccounts = async () => {
  try {
    await connectDB();
    console.log("Seeding demo accounts for live testing...");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo123', salt);

    const demoUsers = [
      {
        name: "Alex Beginner",
        email: "student.beginner@demo.com",
        passwordHash,
        role: "student",
        language: "en",
        learningStyle: "visual",
        pace: "relaxed",
      },
      {
        name: "Priya Improved",
        email: "student.improved@demo.com",
        passwordHash,
        role: "student",
        language: "ta",
        learningStyle: "visual",
        pace: "medium",
      },
      {
        name: "Prof. Sarah Educator",
        email: "educator@demo.com",
        passwordHash,
        role: "educator",
        language: "en",
      },
    ];

    try {
      await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });
      const created = await User.insertMany(demoUsers);
      console.log(`Created ${created.length} demo users.`);

      const improvedUser = created.find((u) => u.email === "student.improved@demo.com");
      if (improvedUser) {
        await Performance.create({
          userId: improvedUser._id,
          courseId: 'c_1',
          topicScores: { 'Syntax': 85, 'Asynchronous Patterns': 42, 'Algorithms': 88 },
          currentLevel: 'medium',
          currentDifficulty: 2,
          history: [
            { date: new Date(Date.now() - 86400000 * 3), score: 42, level: 'easy', engagementScore: 0.9 },
            { date: new Date(Date.now() - 86400000 * 2), score: 65, level: 'medium', engagementScore: 0.85 },
            { date: new Date(), score: 86, level: 'medium', engagementScore: 0.95 },
          ],
        });
      }
    } catch (e) {
      console.log("Memory mode active for demo users.");
    }

    console.log("Demo seed finished.");
    process.exit(0);
  } catch (err) {
    console.error("Demo seeding error:", err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDemoAccounts();
}
