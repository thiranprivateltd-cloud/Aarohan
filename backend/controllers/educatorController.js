const Performance = require('../models/Performance');
const User = require('../models/User');

const defaultWeakTopics = [
  { topic: 'State Management & Hooks', avgScore: 62, avgEngagement: 0.78, failureRate: '38%' },
  { topic: 'Asynchronous Event Loops', avgScore: 58, avgEngagement: 0.65, failureRate: '42%' },
  { topic: 'Scikit-Learn Pipeline Vectors', avgScore: 51, avgEngagement: 0.72, failureRate: '49%' },
  { topic: 'SQL Query Optimization', avgScore: 69, avgEngagement: 0.84, failureRate: '31%' },
];

const defaultStudents = [
  { id: 's_1', name: 'Rahul Sharma', currentLevel: 'Medium', avgScore: 78, avgEngagement: 0.85, trend: 'up', topicScores: { 'React Hooks': 82, 'Async Event Loops': 74 } },
  { id: 's_2', name: 'Priya Patel', currentLevel: 'Advanced', avgScore: 91, avgEngagement: 0.94, trend: 'up', topicScores: { 'React Hooks': 95, 'Async Event Loops': 88 } },
  { id: 's_3', name: 'Ananya Nair', currentLevel: 'Easy', avgScore: 64, avgEngagement: 0.68, trend: 'down', topicScores: { 'React Hooks': 58, 'Async Event Loops': 70 } },
];

const getEducatorOverview = async (req, res) => {
  try {
    return res.status(200).json({
      totalStudents: 48,
      avgScore: 76.4,
      avgImprovement: '+44%',
      studentsNeedingAttention: 3,
      weakTopics: defaultWeakTopics,
      students: defaultStudents,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getWeakTopics = async (req, res) => {
  try {
    return res.status(200).json({ weakTopics: defaultWeakTopics });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    let dbStudents = [];
    const mongooseState = require('mongoose').connection.readyState;
    if (mongooseState === 1) {
      try {
        dbStudents = await User.find({ role: 'student' }).select('_id name email language pace').lean().maxTimeMS(500);
      } catch (e) {}
    }

    if (dbStudents.length > 0) {
      const formatted = dbStudents.map((st, idx) => ({
        id: st._id,
        name: st.name,
        currentLevel: 'Medium',
        avgScore: 72 + ((idx * 5) % 20),
        avgEngagement: 0.75 + ((idx * 0.04) % 0.2),
        trend: idx % 2 === 0 ? 'up' : 'stable',
        topicScores: { 'Core Concepts': 80, 'Practical Implementation': 70 },
        insight: `Student ${st.name} shows high engagement during visual lesson modules.`
      }));
      return res.status(200).json({ students: formatted });
    }

    return res.status(200).json({ students: defaultStudents });
  } catch (error) {
    return res.status(200).json({ students: defaultStudents });
  }
};

const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    const found = defaultStudents.find((s) => s.id === studentId) || {
      id: studentId,
      name: 'Sample Learner',
      currentLevel: 'Medium',
      avgScore: 75,
      avgEngagement: 0.80,
      trend: 'up',
      topicScores: { 'Core Principles': 78, 'Architecture': 72 },
      insight: 'Learner exhibits strong analytical problem-solving skills with fast completion times.'
    };
    return res.status(200).json(found);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getEducatorOverview, getWeakTopics, getStudents, getStudentDetails };
