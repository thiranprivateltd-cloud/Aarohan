import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export const CourseAssessment = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || 'c_1';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const questions = [
    { text: "What is the primary execution flow in asynchronous web requests?", options: ["Blocking thread loop", "Non-blocking event loop callbacks", "Hardware interrupts", "Manual CPU cycles"], correctIndex: 1 },
    { text: "Which data structure provides O(1) average lookup time?", options: ["Array List", "Binary Tree", "Hash Map / Object", "Linked List"], correctIndex: 2 },
    { text: "In ML, what problem does regularization solve?", options: ["Database deadlocks", "Overfitting model to training data", "Slow network speeds", "UI rerendering"], correctIndex: 1 },
    { text: "What is the function of a REST API status code 201?", options: ["OK Success", "Created successfully", "Unauthorized", "Internal Server Error"], correctIndex: 1 },
    { text: "Why are adaptive learning systems superior to fixed curricula?", options: ["They lock user pace", "They dynamically calibrate difficulty to quiz performance and engagement", "They bypass quizzes", "They only use static text"], correctIndex: 1 },
  ];

  const handleSelect = (optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optionIndex });
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
        type: 'placement',
        courseId,
        answers: formattedAnswers,
      });
      navigate(`/lesson?courseId=${courseId}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Placement assessment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border border-slate-100 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Course Placement Quiz</h2>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
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
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
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
            {submitting ? 'Calibrating Path...' : 'Submit Placement Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-md transition"
          >
            Next Question
          </button>
        )}
      </div>
    </div>
  );
};
