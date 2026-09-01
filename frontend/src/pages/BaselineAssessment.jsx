import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const BaselineAssessment = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/assessments/baseline');
        setQuestions(res.data.questions || []);
      } catch (err) {
        console.error('Failed to load baseline questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optionIndex });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const formattedAnswers = questions.map((q, idx) => ({
      questionText: q.text,
      selectedOption: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1,
      correctIndex: q.correctIndex,
    }));

    try {
      await api.post('/assessments/submit', {
        type: 'baseline',
        answers: formattedAnswers,
      });
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-slate-500">Loading baseline assessment...</div>;
  if (!questions.length) return <div className="text-center p-8 text-slate-500">No assessment questions available.</div>;

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-slate-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Baseline Skill Assessment</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-slate-800 mb-4">{currentQ.text}</h3>
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-3.5 rounded-lg border text-sm transition ${
                selectedAnswers[currentIndex] === idx
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm border rounded-md text-slate-600 disabled:opacity-40"
        >
          Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition"
          >
            {submitting ? 'Submitting...' : 'Complete Baseline'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};
