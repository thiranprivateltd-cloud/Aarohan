const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Performance = require('../models/Performance');
const { inMemoryPerformance } = require('./quizController');

const memoryCourses = Array.from({ length: 14 }, (_, i) => ({
  _id: `c_${i + 1}`,
  id: `c_${i + 1}`,
  title: `Course ${i + 1}: ${[
    'Full-Stack Web Development',
    'Python & Data Structures',
    'Foundations of AI & Machine Learning',
    'Data Science & Big Data Analytics',
    'Cloud Computing & DevOps Architecture',
    'Cybersecurity Essentials & Ethical Hacking',
    'Mobile App Development with Flutter & React Native',
    'UI/UX Design Systems & Human-Computer Interaction',
    'Database Systems & Distributed SQL',
    'Software Engineering Principles & Agile Design',
    'Natural Language Processing & Large Language Models',
    'Computer Vision & Deep Learning Systems',
    'TypeScript & Scalable Frontend Architecture',
    'Blockchain Architecture & Smart Contracts'
  ][i]}`,
  category: ['Programming', 'Programming', 'AI & Data', 'AI & Data', 'Cloud & Security', 'Cloud & Security', 'Mobile', 'Design', 'Database', 'Software Engineering', 'AI & Data', 'AI & Data', 'Programming', 'Cloud & Security'][i],
  description: `Comprehensive module on modern domain principles, scalable design patterns, and hands-on projects.`,
  recommendedLevel: 'Medium',
}));

// Tier-Specific Multilingual Content Dictionaries for Easy, Medium, and Hard
const adaptiveTierContent = {
  easy: {
    en: {
      title: "Lesson 1 (Easy): Foundations & Core Concepts",
      text: "Welcome to the Easy Tier. We start with fundamental concepts, step-by-step guidance, and simple execution examples.",
      examples: ["const total = 10 + 20;", "console.log('Basic addition result:', total);"],
      keyPoints: ["Learn basic definitions", "Follow step-by-step logic", "Verify elementary outputs"],
    },
    ta: {
      title: "பாடம் 1 (எளிது): அடிப்படை கோட்பாடுகள்",
      text: "எளிதான நிலைக்கு நல்வரவு. நாங்கள் அடிப்படை கருத்துக்கள், எளிய வழிகாட்டுதல்கள் மற்றும் நேரடி உதாரணங்களுடன் தொடங்குகிறோம்.",
      examples: ["const மொத்தம் = 10 + 20;", "console.log('அடிப்படை கூட்டல்:', மொத்தம்);"],
      keyPoints: ["அடிப்படை வரைவிலக்கணங்களைக் கற்றுக்கொள்ளுங்கள்", "படிப்பிடியாகப் பின்பற்றுங்கள்", "வெளியீட்டை சரிபார்க்கவும்"],
    },
    hi: {
      title: "पाठ 1 (आसान): बुनियादी अवधारणाएं",
      text: "आसान स्तर में आपका स्वागत है। हम बुनियादी अवधारणाओं और सरल उदाहरणों से शुरुआत करते हैं।",
      examples: ["const कुल = 10 + 20;", "console.log('योग:', कुल);"],
      keyPoints: ["बुनियादी परिभाषाएं सीखें", "चरण-दर-चरण तर्क का पालन करें", "परिणाम सत्यापित करें"],
    },
  },
  medium: {
    en: {
      title: "Lesson 2 (Medium): Modular Architecture & Data Flow",
      text: "Welcome to the Medium Tier. Here we analyze modular component state, async pipelines, and dynamic event handling.",
      examples: ["const response = await fetch('/api/data');", "const json = await response.json();"],
      keyPoints: ["Understand asynchronous state flow", "Handle modular API promises", "Optimize event listeners"],
    },
    ta: {
      title: "பாடம் 2 (நடுத்தரம்): மொடியூலார் கட்டிடக்கலை",
      text: "நடுத்தர நிலைக்கு நல்வரவு. இங்கு நாங்கள் மொடியூலார் கூறுகள் மற்றும் தரவு ஓட்டத்தை ஆராய்கிறோம்.",
      examples: ["const பதில் = await fetch('/api/data');", "const தரவு = await பதில்.json();"],
      keyPoints: ["ஒத்திசைவற்ற தரவு ஓட்டத்தைப் புரிந்து கொள்ளுங்கள்", "API கோரிக்கைகளைக் கையாளுங்கள்", "நிகழ்வுகளை மேம்படுத்துங்கள்"],
    },
    hi: {
      title: "पाठ 2 (मध्यम): मॉड्यूलर वास्तुकला",
      text: "मध्यम स्तर में आपका स्वागत है। यहाँ हम मॉड्यूलर घटकों और डेटा प्रवाह का विश्लेषण करते हैं।",
      examples: ["const उत्तर = await fetch('/api/data');", "const डेटा = await उत्तर.json();"],
      keyPoints: ["असिंक्रोनस डेटा प्रवाह समझें", "एपीआई वादों को संभालें", "इवेंट श्रोताओं को अनुकूलित करें"],
    },
  },
  hard: {
    en: {
      title: "Lesson 3 (Hard): Advanced Distributed Systems & Optimization",
      text: "Welcome to the Hard Tier. Deep dive into distributed state consensus, memory optimization, and microservice resilience.",
      examples: ["const cluster = await DistributedCluster.connect({ poolSize: 50 });", "await cluster.executePipeline();"],
      keyPoints: ["Design fault-tolerant pipelines", "Optimize garbage collection & concurrency", "Enforce zero-trust protocol schemas"],
    },
    ta: {
      title: "பாடம் 3 (கடினம்): மேம்பட்ட பரவல் அமைப்புகள்",
      text: "கடினமான நிலைக்கு நல்வரவு. பரவலாக்கப்பட்ட அமைப்புகள் மற்றும் நினைவக மேம்பாட்டை இங்கு விரிவாக ஆராய்வோம்.",
      examples: ["const க்ளஸ்டர் = await DistributedCluster.connect({ poolSize: 50 });", "await க்ளஸ்டர்.executePipeline();"],
      keyPoints: ["பிழை தாங்கும் அமைப்புகளை வடிவமையுங்கள்", "நினைவக பயன்பாட்டை மேம்படுத்துங்கள்", "பாதுகாப்பு நெறிமுறைகளை அமல்படுத்துங்கள்"],
    },
    hi: {
      title: "पाठ 3 (कठिन): उन्नत वितरित प्रणाली",
      text: "कठिन स्तर में आपका स्वागत है। वितरित प्रणालियों और मेमोरी अनुकूलन का गहरा अध्ययन करें।",
      examples: ["const क्लस्टर = await DistributedCluster.connect({ poolSize: 50 });", "await क्लस्टर.executePipeline();"],
      keyPoints: ["त्रुटि-सहनशील पाइपलाइनों को डिज़ाइन करें", "मेमोरी और समवर्ती अनुकूलित करें", "शून्य-विश्वास प्रोटोकॉल लागू करें"],
    },
  },
};

const getRecommendedCourses = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    let userLanguage = 'en';
    let userPace = 'medium';
    let userPerformanceHistory = [];

    if (userId && userId !== 'demo_user') {
      try {
        const user = await User.findById(userId).select('language pace').lean();
        if (user) {
          userLanguage = user.language || 'en';
          userPace = user.pace || 'medium';
        }
        const perf = await Performance.find({ userId }).select('courseId currentLevel lastScore').lean();
        if (perf) userPerformanceHistory = perf;
      } catch (e) {}
    }

    let dbCourses = [];
    const mongooseState = require('mongoose').connection.readyState;

    if (mongooseState === 1) {
      try {
        dbCourses = await Course.find({}).lean().maxTimeMS(500);
      } catch (e) {
        dbCourses = memoryCourses;
      }
    } else {
      dbCourses = memoryCourses;
    }

    const coursesToUse = dbCourses.length > 0 ? dbCourses : memoryCourses;

    const personalizedCourses = coursesToUse.map((course, idx) => {
      let currentLevel = 'Medium';
      const cId = course._id || course.id;

      if (inMemoryPerformance.has(`${userId}_${cId}`)) {
        currentLevel = inMemoryPerformance.get(`${userId}_${cId}`).currentLevel || 'Medium';
      } else {
        const userPerf = userPerformanceHistory.find((p) => String(p.courseId) === String(cId));
        if (userPerf) currentLevel = userPerf.currentLevel;
      }

      let matchScore = 85 + ((idx * 3) % 12);
      if (userPace === 'fast') matchScore += 3;
      matchScore = Math.min(99, Math.max(70, matchScore));

      return {
        ...course,
        matchPercentage: matchScore,
        recommendedLevel: currentLevel,
      };
    });

    personalizedCourses.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return res.status(200).json({ courses: personalizedCourses, userLanguage });
  } catch (error) {
    return res.status(200).json({ courses: memoryCourses, userLanguage: 'en' });
  }
};

const getNextLesson = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const { courseId, lang } = req.query;
    const targetCourseId = courseId || 'c_1';
    let targetLang = lang || 'en';

    let currentLevel = 'easy';

    // 1. Check in-memory store for real-time tier updates after quiz submission
    if (inMemoryPerformance.has(`${userId}_${targetCourseId}`)) {
      currentLevel = inMemoryPerformance.get(`${userId}_${targetCourseId}`).currentLevel || 'easy';
    } else if (userId && userId !== 'demo_user') {
      try {
        const perf = await Performance.findOne({ userId, courseId: targetCourseId }).select('currentLevel').lean();
        if (perf && perf.currentLevel) {
          currentLevel = perf.currentLevel;
        }
      } catch (e) {}
    }

    const tierContentMap = adaptiveTierContent[currentLevel.toLowerCase()] || adaptiveTierContent['easy'];
    const localizedContent = tierContentMap[targetLang] || tierContentMap['en'] || adaptiveTierContent['easy']['en'];

    return res.status(200).json({
      lessonId: `l_${currentLevel}`,
      courseId: targetCourseId,
      title: localizedContent.title,
      currentLevel,
      content: {
        text: localizedContent.text,
        examples: localizedContent.examples,
        keyPoints: localizedContent.keyPoints,
      },
      quiz: [
        {
          text: `What is the primary objective of adaptive learning systems at the ${currentLevel.toUpperCase()} level?`,
          options: [
            "Provide static un-customized content to all learners",
            `Dynamically adjust content pacing and difficulty to the ${currentLevel.toUpperCase()} tier`,
            "Disable adaptive quizzes completely",
            "Enforce fixed static time schedules",
          ],
          correctIndex: 1,
        },
        {
          text: `How do real-time behavioral signals influence your ${currentLevel.toUpperCase()} lesson level?`,
          options: [
            "They increase lesson quiz scores automatically",
            "They trigger real-time tier recalculation and AI tutoring prompts",
            "They log the user out immediately",
            "They reset progress to zero",
          ],
          correctIndex: 1,
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getRecommendedCourses, getNextLesson, memoryCourses };
