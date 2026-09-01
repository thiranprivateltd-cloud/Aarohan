import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const TTSPlayer = ({ text, language = 'en' }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [hasVoice, setHasVoice] = useState(true);

  // 10 BCP-47 Language Code Mapping
  const langTargetMap = {
    en: ['en-US', 'en'],
    ta: ['ta-IN', 'ta'],
    hi: ['hi-IN', 'hi'],
    te: ['te-IN', 'te'],
    kn: ['kn-IN', 'kn'],
    ml: ['ml-IN', 'ml'],
    bn: ['bn-IN', 'bn'],
    mr: ['mr-IN', 'mr'],
    gu: ['gu-IN', 'gu'],
    pa: ['pa-IN', 'pa'],
  };

  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        const targetPrefixes = langTargetMap[language] || ['en-US', 'en'];
        const matched = availableVoices.some((v) =>
          targetPrefixes.some((p) => v.lang.toLowerCase().startsWith(p.toLowerCase()))
        );

        setHasVoice(matched || availableVoices.length === 0 || language === 'en');
      } else {
        setHasVoice(false);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, language]);

  const handlePlay = () => {
    if (!window.speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetPrefixes = langTargetMap[language] || ['en-US', 'en'];
    const availableVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();

    const matchedVoice = availableVoices.find((v) =>
      targetPrefixes.some((p) => v.lang.toLowerCase().startsWith(p.toLowerCase()))
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = targetPrefixes[0];
    }

    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!hasVoice) {
    return (
      <div className="bg-amber-100 text-slate-900 border border-amber-300 text-xs px-3 py-2 rounded-lg font-lexend font-bold flex items-center gap-1.5" role="status" aria-live="polite">
        <span>⚠️ Voice not available for this language on your device</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-lg border border-amber-200 shadow-sm font-lexend">
      <span className="text-xs font-bold text-slate-900 mr-1">🔊 Text-To-Speech ({language.toUpperCase()} Voice):</span>
      {!isPlaying ? (
        <button
          onClick={handlePlay}
          aria-label={`Read content aloud in ${language.toUpperCase()}`}
          className="bg-[#2F5233] hover:bg-[#244127] text-white text-xs px-3.5 py-1.5 rounded transition flex items-center gap-1 font-bold shadow-sm focus:ring-2 focus:ring-emerald-700"
          style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
        >
          ▶ {t('readAloud')}
        </button>
      ) : (
        <button
          onClick={handlePause}
          aria-label="Pause speech reading"
          className="bg-amber-700 hover:bg-amber-800 text-white text-xs px-3.5 py-1.5 rounded transition font-bold focus:ring-2 focus:ring-amber-700"
          style={{ backgroundColor: '#B45309', color: '#FFFFFF' }}
        >
          ⏸ {t('pause')}
        </button>
      )}
      {(isPlaying || isPaused) && (
        <button
          onClick={handleStop}
          aria-label="Stop speech reading"
          className="bg-red-700 hover:bg-red-800 text-white text-xs px-3.5 py-1.5 rounded transition font-bold focus:ring-2 focus:ring-red-700"
          style={{ backgroundColor: '#B91C1C', color: '#FFFFFF' }}
        >
          ⏹ {t('stop')}
        </button>
      )}
    </div>
  );
};
