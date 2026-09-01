import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

export const AITutorWidget = ({ lessonId, externalMessage }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const initialGreeting = {
    en: 'Hello! I am your AI Tutor. Ask me anything about this lesson!',
    ta: 'வணக்கம்! நான் உங்கள் AI ஆசிரியர். இந்தப் பாடத்தைப் பற்றி எதுவும் கேளுங்கள்!',
    hi: 'नमस्ते! मैं आपका एआई ट्यूटर हूं। इस पाठ के बारे में कुछ भी पूछें!',
    ml: 'ഹലോ! ഞാൻ നിങ്ങളുടെ എഐ ട്യൂട്ടറാണ്. ഈ പാഠത്തെക്കുറിച്ച് എന്തും ചോദിക്കൂ!',
    te: 'హలో! నేను మీ ఏഐ ట్యూటర్. ఈ పాఠం గురించి నన్ను ఏమైనా అడగండి!',
  };

  useEffect(() => {
    setMessages([
      { sender: 'bot', text: initialGreeting[i18n.language] || initialGreeting['en'] }
    ]);
  }, [i18n.language]);

  useEffect(() => {
    if (externalMessage) {
      setMessages((prev) => [...prev, { sender: 'bot', text: `🤖 [Proactive Suggestion]: ${externalMessage}` }]);
      setIsOpen(true);
    }
  }, [externalMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/tutor/ask', {
        question: userMsg,
        lessonId,
        language: i18n.language,
      });
      setMessages((prev) => [...prev, { sender: 'bot', text: res.data.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an issue fetching a response. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-lexend">
      {isOpen ? (
        <div className="bg-white border border-amber-300 rounded-2xl shadow-2xl w-80 sm:w-96 h-96 flex flex-col overflow-hidden">
          <div className="bg-[#C4623A] text-white p-3.5 flex justify-between items-center font-bold text-sm" style={{ backgroundColor: '#C4623A', color: '#FFFFFF' }}>
            <span className="flex items-center gap-2">🤖 {t('aiTutor')} ({i18n.language.toUpperCase()})</span>
            <button onClick={() => setIsOpen(false)} aria-label="Close AI Tutor chat" className="hover:text-amber-200 text-lg font-bold">×</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm bg-amber-50/40">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 text-xs sm:text-sm font-semibold ${
                    m.sender === 'user'
                      ? 'bg-[#C4623A] text-white rounded-br-none shadow-sm'
                      : 'bg-white border border-amber-200 text-slate-900 rounded-bl-none shadow-sm'
                  }`}
                  style={m.sender === 'user' ? { backgroundColor: '#C4623A', color: '#FFFFFF' } : { backgroundColor: '#FFFFFF', color: '#0F172A' }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-slate-700 font-bold italic">AI Tutor is thinking...</div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-2.5 border-t border-amber-200 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('askQuestion')}
              aria-label="Ask AI Tutor a question"
              className="flex-1 border border-amber-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-900 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-[#C4623A] font-medium"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2F5233] hover:bg-[#244127] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
              style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
            >
              {t('send')}
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Tutor widget"
          className="bg-[#C4623A] hover:bg-[#AA4E28] text-white p-4 rounded-full shadow-2xl flex items-center justify-center font-bold transition transform hover:scale-105 border-2 border-white"
          style={{ backgroundColor: '#C4623A', color: '#FFFFFF' }}
        >
          💬 {t('aiTutor')}
        </button>
      )}
    </div>
  );
};
