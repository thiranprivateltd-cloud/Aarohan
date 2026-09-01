const axios = require('axios');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const Performance = require('../models/Performance');

const langNameMap = {
  en: 'English',
  ta: 'Tamil (தமிழ்)',
  hi: 'Hindi (हिंदी)',
  ml: 'Malayalam (മലയാളം)',
  te: 'Telugu (తెలుగు)',
};

const tutorFallbackMap = {
  en: "Great question about '{q}'! As a {level} student learning {lessonTitle}, focus on how key modular concepts and adaptive feedback loops work together.",
  ta: "'{q}' பற்றிய சிறந்த கேள்வி! {level} நிலையில் {lessonTitle} பயிலும் மாணவராக, முக்கிய கருத்துக்கள் எவ்வாறு ஒன்றிணைந்து செயல்படுகின்றன என்பதில் கவனம் செலுத்துங்கள்.",
  hi: "'{q}' के बारे में बढ़िया सवाल! {level} स्तर पर {lessonTitle} सीख रहे छात्र के रूप में, मुख्य अवधारणाओं पर ध्यान केंद्रित करें।",
  ml: "'{q}' എന്നതിനെക്കുറിച്ചുള്ള മികച്ച ചോദ്യം! {level} തലത്തിൽ {lessonTitle} പഠിക്കുന്ന വിദ്യാർത്ഥി എന്ന നിലയിൽ, പ്രധാന ആശയങ്ങളിൽ ശ്രദ്ധ കേന്ദ്രീകരിക്കുക.",
  te: "'{q}' గురించిన మంచి ప్రశ్న! {level} స్థాయిలో {lessonTitle} నేర్చుకుంటున్న విద్యార్థిగా, ముఖ్యమైన అంశాలపై దృష్టి పెట్టండి.",
};

const askTutor = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_user';
    const { question, lessonId, language } = req.body;

    console.log(`🤖 AI Tutor Request received from User [${userId}]: question="${question}", language="${language}", lessonId="${lessonId}"`);

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    let userLanguage = language || 'en';
    let userLevel = 'medium';
    let lessonTitle = 'Core Software Principles';

    try {
      const user = await User.findById(userId).select('language').lean();
      if (user && user.language) userLanguage = user.language;
      if (language) userLanguage = language;

      if (lessonId) {
        const lesson = await Lesson.findById(lessonId).select('title').lean();
        if (lesson) lessonTitle = lesson.title;
      }

      const perf = await Performance.findOne({ userId }).select('currentLevel').lean();
      if (perf) userLevel = perf.currentLevel || 'medium';
    } catch (e) {
      console.warn("Tutor user context lookup warning:", e.message);
    }

    const fullLangName = langNameMap[userLanguage] || 'English';
    const apiKey = process.env.OPENAI_API_KEY;

    console.log(`🔑 OpenAI API Key status: ${apiKey ? 'LOADED (length: ' + apiKey.length + ')' : 'MISSING'}`);

    if (apiKey && !apiKey.includes('your_openai_api_key')) {
      try {
        const systemPrompt = `You are a patient AI Tutor helping a ${userLevel} student learning ${lessonTitle}. You MUST respond COMPLETELY in ${fullLangName} (Language code: ${userLanguage}). Provide simple, clear explanations and examples tailored to a ${userLevel} level student. Keep your answer within 2-3 sentences.`;

        console.log(`📡 Sending request to OpenAI API (gpt-3.5-turbo)... System Prompt: "${systemPrompt}"`);

        const openaiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question },
            ],
            max_tokens: 250,
            temperature: 0.7,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            timeout: 1800,
          }
        );

        console.log(`✅ OpenAI raw response status: ${openaiRes.status}`);
        const aiReply = openaiRes.data.choices[0]?.message?.content;
        if (aiReply) {
          console.log(`🎯 AI Tutor GPT Output parsed successfully: "${aiReply.substring(0, 50)}..."`);
          return res.status(200).json({ response: aiReply });
        }
      } catch (apiErr) {
        console.error("❌ OpenAI API call failed or timed out:", apiErr.response ? JSON.stringify(apiErr.response.data) : apiErr.message);
      }
    }

    console.log(`ℹ️ Serving dynamic localized fallback response for language [${userLanguage}]...`);
    const fallbackTemplate = tutorFallbackMap[userLanguage] || tutorFallbackMap['en'];
    const formattedReply = fallbackTemplate
      .replace('{q}', question)
      .replace('{level}', userLevel.toUpperCase())
      .replace('{lessonTitle}', lessonTitle);

    return res.status(200).json({ response: formattedReply });
  } catch (error) {
    console.error("❌ Fatal askTutor error:", error.message);
    return res.status(200).json({
      response: "I am here to help you learn! Feel free to ask any question about this lesson.",
    });
  }
};

module.exports = { askTutor };
