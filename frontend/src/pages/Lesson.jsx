import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { LevelChangeModal } from '../components/LevelChangeModal';
import { AITutorWidget } from '../components/AITutorWidget';
import { TTSPlayer } from '../components/TTSPlayer';
import { VisualEngagementTracker } from '../components/VisualEngagementTracker';

export const Lesson = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || 'c_1';

  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Behavioral trackers
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [idleSeconds, setIdleSeconds] = useState(0);
  const lastActivityRef = useRef(Date.now());

  // Quiz Modal & Submit State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // AI Tutor trigger hook from visual tracker
  const [proactiveTutorMsg, setProactiveTutorMsg] = useState('');

  // Level change popup state
  const [levelModalData, setLevelModalData] = useState({
    isOpen: false,
    previousLevel: '',
    newLevel: '',
    engagementNote: '',
  });

  useEffect(() => {
    const fetchNextLesson = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/lessons/next?courseId=${courseId}&lang=${i18n.language}`);
        setLessonData(res.data);
      } catch (err) {
        console.error('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNextLesson();
  }, [courseId, i18n.language]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setTabSwitchCount((prev) => prev + 1);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 15000) {
        setIdleSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      clearInterval(interval);
    };
  }, []);

  const handleSelectOption = (qIdx, optIdx) => {
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx });
  };

  const handleSubmitQuiz = async () => {
    if (!lessonData) return;
    setSubmittingQuiz(true);

    const formattedAnswers = (lessonData.quiz || []).map((q, idx) => ({
      questionText: q.text,
      selectedOption: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1,
      correctIndex: q.correctIndex,
    }));

    const engagementPayload = {
      tabSwitchCount,
      idleSeconds,
      avgTimePerSection: 20,
    };

    try {
      await api.post('/engagement/log', {
        lessonId: lessonData.lessonId,
        ...engagementPayload,
      });

      const res = await api.post('/quizzes/submit', {
        lessonId: lessonData.lessonId,
        answers: formattedAnswers,
        engagementData: engagementPayload,
      });

      setShowQuizModal(false);

      if (res.data.leveledUp || res.data.recommendation?.engagementNote) {
        setLevelModalData({
          isOpen: true,
          previousLevel: res.data.previousLevel,
          newLevel: res.data.newLevel,
          engagementNote: res.data.recommendation?.engagementNote,
        });
      } else {
        alert(`Quiz Complete! Score: ${res.data.score}%. Difficulty remains: ${res.data.newLevel}`);
      }

      const updated = await api.get(`/courses/lessons/next?courseId=${courseId}&lang=${i18n.language}`);
      setLessonData(updated.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-slate-900 font-lexend font-bold">Loading lesson content...</div>;
  if (!lessonData) return <div className="text-center p-8 text-slate-900 font-lexend font-bold">No lesson found for this course.</div>;

  const { title, currentLevel, content, quiz } = lessonData;

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-lexend bg-[#FDF6EC]">
      {/* Header Banner */}
      <div className="bg-white border border-amber-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-[#8C3D1D] uppercase tracking-wider">{t('lesson')}</span>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 border border-amber-300 text-[#8C3D1D] px-3 py-1.5 rounded-lg text-xs font-bold capitalize">
            Current Tier: <span className="underline">{currentLevel}</span>
          </div>
          <button
            onClick={() => setShowQuizModal(true)}
            aria-label="Take lesson quiz"
            className="bg-[#2F5233] hover:bg-[#244127] text-white font-bold text-sm px-4 py-2 rounded-lg transition shadow-sm"
            style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
          >
            {t('takeLessonQuiz')}
          </button>
        </div>
      </div>

      {/* Text-to-Speech & Visual Engagement Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TTSPlayer text={content.text} language={i18n.language} />
        <VisualEngagementTracker onTriggerTutor={(msg) => setProactiveTutorMsg(msg)} />
      </div>

      {/* Telemetry Bar */}
      <div className="bg-amber-100/70 border border-amber-300 p-3 rounded-lg flex items-center justify-between text-xs text-slate-800">
        <div className="flex items-center gap-4">
          <span className="font-bold text-slate-900">📡 {t('telemetry')}:</span>
          <span>{t('tabSwitches')}: <strong className="text-[#8C3D1D] font-bold">{tabSwitchCount}</strong></span>
          <span>{t('idleSeconds')} (&gt;15s): <strong className="text-[#8C3D1D] font-bold">{idleSeconds}s</strong></span>
        </div>
      </div>

      {/* Main Lesson Content */}
      <div className="bg-white border border-amber-200 p-8 rounded-xl shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">{t('lessonOverview')} ({i18n.language.toUpperCase()})</h2>
          <p className="text-slate-900 leading-relaxed text-sm font-normal">{content.text}</p>
        </div>

        {content.examples && content.examples.length > 0 && (
          <div>
            <h3 className="text-md font-bold text-slate-900 mb-2">{t('practicalExamples')}</h3>
            <div className="space-y-2">
              {content.examples.map((ex, idx) => (
                <div key={idx} className="bg-amber-50 border-l-4 border-[#C4623A] p-3 text-xs sm:text-sm text-slate-900 font-mono font-bold">
                  {ex}
                </div>
              ))}
            </div>
          </div>
        )}

        {content.keyPoints && content.keyPoints.length > 0 && (
          <div>
            <h3 className="text-md font-bold text-slate-900 mb-2">{t('keyTakeaways')}</h3>
            <ul className="list-disc list-inside text-sm text-slate-900 space-y-1 font-medium">
              {content.keyPoints.map((kp, idx) => (
                <li key={idx}>{kp}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* End-of-Lesson Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-900 mb-4">End-of-Lesson Knowledge Assessment</h3>
            <div className="space-y-6">
              {quiz.map((q, qIdx) => (
                <div key={qIdx} className="border-b border-amber-100 pb-4">
                  <p className="font-bold text-sm text-slate-900 mb-2">
                    {qIdx + 1}. {q.text}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        aria-label={`Option ${optIdx + 1}`}
                        className={`w-full text-left p-2.5 rounded border text-xs sm:text-sm transition ${
                          selectedAnswers[qIdx] === optIdx
                            ? 'bg-amber-100 border-[#C4623A] text-[#8C3D1D] font-bold'
                            : 'border-slate-300 hover:bg-amber-50 text-slate-900 font-medium'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowQuizModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submittingQuiz}
                className="bg-[#2F5233] hover:bg-[#244127] text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-lg transition"
                style={{ backgroundColor: '#2F5233', color: '#FFFFFF' }}
              >
                {submittingQuiz ? 'Evaluating Adaptive Level...' : 'Submit & Re-Evaluate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Change Notification Modal */}
      <LevelChangeModal
        isOpen={levelModalData.isOpen}
        onClose={() => setLevelModalData({ ...levelModalData, isOpen: false })}
        previousLevel={levelModalData.previousLevel}
        newLevel={levelModalData.newLevel}
        engagementNote={levelModalData.engagementNote}
      />

      {/* Floating AI Tutor Chat Widget */}
      <AITutorWidget lessonId={lessonData.lessonId} externalMessage={proactiveTutorMsg} />
    </div>
  );
};
